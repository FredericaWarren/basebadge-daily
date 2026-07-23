import type { EIP1193Provider } from "viem";

type WalletProvider = EIP1193Provider & {
  isMetaMask?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
  providers?: WalletProvider[];
};

type Eip6963ProviderDetail = {
  info: {
    name?: string;
    rdns?: string;
    uuid?: string;
  };
  provider: WalletProvider;
};

declare global {
  interface Window {
    ethereum?: WalletProvider;
    __baseBadgeProviders?: Eip6963ProviderDetail[];
  }

  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent<Eip6963ProviderDetail>;
  }
}

export {};
