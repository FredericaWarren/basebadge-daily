import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors/coinbaseWallet";
import { injected, type InjectedParameters } from "wagmi/connectors/injected";

const configuredSuffix = process.env.NEXT_PUBLIC_DATA_SUFFIX;
const dataSuffix =
  configuredSuffix && configuredSuffix.startsWith("0x")
    ? (configuredSuffix as `0x${string}`)
    : ("0x" as `0x${string}`);

function injectedWithTarget(name: "okx" | "metamask") {
  return injected({
    target: (() => {
      if (typeof window === "undefined") {
        return undefined;
      }

      const ethereum = window.ethereum;

      const providers = ethereum?.providers ?? (ethereum ? [ethereum] : []);
      if (!ethereum) return undefined;

      return {
        id: name,
        name: name === "okx" ? "OKX Wallet" : "MetaMask",
        provider() {
          const selected =
            name === "okx"
              ? providers.find((item) => item.isOkxWallet || item.isOKExWallet)
              : providers.find((item) => item.isMetaMask && !item.isOkxWallet && !item.isOKExWallet);
          return selected ?? ethereum;
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

export const walletOptions = [
  { id: "okx", label: "OKX Wallet", connector: okxConnector },
  { id: "metamask", label: "MetaMask", connector: metaMaskConnector },
  { id: "coinbase", label: "Coinbase Wallet", connector: coinbaseConnector }
] as const;

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [okxConnector, metaMaskConnector, coinbaseConnector],
  transports: {
    [base.id]: http()
  },
  dataSuffix
});
