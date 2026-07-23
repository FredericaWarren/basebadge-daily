import type { EIP1193Provider } from "viem";

declare global {
  interface Window {
    ethereum?: EIP1193Provider & {
      providers?: Array<EIP1193Provider & { isMetaMask?: boolean; isOkxWallet?: boolean; isOKExWallet?: boolean }>;
      isMetaMask?: boolean;
      isOkxWallet?: boolean;
      isOKExWallet?: boolean;
    };
  }
}

export {};
