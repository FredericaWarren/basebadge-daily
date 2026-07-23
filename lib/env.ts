import { getAddress, isAddress, zeroAddress, type Address } from "viem";

export const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "8453");
const defaultContractAddress = "0x0ac6a3541f7a6206aa39c194838ddf1debab965c";

export const contractAddress = (() => {
  const value = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? defaultContractAddress;
  const normalizedValue = value?.toLowerCase();
  if (normalizedValue && isAddress(normalizedValue)) {
    return getAddress(normalizedValue);
  }
  return zeroAddress;
})();

export const hasContractAddress = contractAddress !== zeroAddress;

export function normalizeAddress(value: string | null | undefined): Address | undefined {
  const normalizedValue = value?.toLowerCase();
  if (!normalizedValue || !isAddress(normalizedValue)) return undefined;
  return getAddress(normalizedValue);
}

export function shortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
