import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors/baseAccount";
import { coinbaseWallet } from "wagmi/connectors/coinbaseWallet";
import { injected, type InjectedParameters } from "wagmi/connectors/injected";
import { dataSuffix } from "@/lib/attribution";

type InjectedWallet = "okx" | "metamask";
type ProviderWindow = Pick<Window, "ethereum" | "__baseBadgeProviders">;

function rememberEip6963Providers() {
  if (typeof window === "undefined" || window.__baseBadgeProviders) return;
  window.__baseBadgeProviders = [];
  window.addEventListener("eip6963:announceProvider", (event) => {
    const exists = window.__baseBadgeProviders?.some((item) => item.info.uuid === event.detail.info.uuid);
    if (!exists) window.__baseBadgeProviders?.push(event.detail);
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

function getInjectedProviders(targetWindow?: ProviderWindow) {
  const ethereum = targetWindow?.ethereum;
  const legacyProviders = ethereum?.providers ?? (ethereum ? [ethereum] : []);
  const eip6963Providers = targetWindow?.__baseBadgeProviders?.map((item) => item.provider) ?? [];
  return [...eip6963Providers, ...legacyProviders];
}

function findInjectedProvider(name: InjectedWallet, targetWindow?: ProviderWindow) {
  const providers = getInjectedProviders(targetWindow);
  if (name === "okx") {
    return providers.find((item) => item.isOkxWallet || item.isOKExWallet);
  }
  return providers.find((item) => item.isMetaMask === true && !item.isOkxWallet && !item.isOKExWallet);
}

export function hasInjectedWallet(name: InjectedWallet) {
  if (typeof window === "undefined") return false;
  rememberEip6963Providers();
  return Boolean(findInjectedProvider(name, window));
}

function injectedWithTarget(name: InjectedWallet) {
  return injected({
    unstable_shimAsyncInject: 2_000,
    target: (() => {
      if (typeof window === "undefined") {
        return undefined;
      }

      rememberEip6963Providers();

      return {
        id: name,
        name: name === "okx" ? "OKX Wallet" : "MetaMask",
        provider(targetWindow) {
          return findInjectedProvider(name, targetWindow as ProviderWindow | undefined);
        }
      };
    }) as NonNullable<InjectedParameters["target"]>
  });
}

export const okxConnector = injectedWithTarget("okx");
export const metaMaskConnector = injectedWithTarget("metamask");
export const coinbaseConnector = coinbaseWallet({
  appName: "BaseBadge Daily",
  preference: { options: "eoaOnly" }
});
export const baseAccountConnector = baseAccount({
  appName: "BaseBadge Daily",
  preference: { options: "all" }
});

export const walletOptions = [
  { id: "okx", label: "OKX Wallet", connector: okxConnector },
  { id: "metamask", label: "MetaMask", connector: metaMaskConnector },
  { id: "coinbase", label: "Coinbase Wallet", connector: coinbaseConnector }
] as const;

const connectors =
  typeof window === "undefined"
    ? ([okxConnector, metaMaskConnector, coinbaseConnector] as const)
    : ([okxConnector, metaMaskConnector, coinbaseConnector, baseAccountConnector] as const);

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [base.id]: http()
  },
  dataSuffix
});
