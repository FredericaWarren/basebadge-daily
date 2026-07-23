import { Attribution } from "ox/erc8021";
import { concatHex, encodeFunctionData, type Address, type Hex } from "viem";
import { baseBadgeDailyAbi } from "@/lib/baseBadgeDailyAbi";

export const builderCode = process.env.NEXT_PUBLIC_BUILDER_CODE ?? "bc_29s8yo05";

export const dataSuffix = Attribution.toDataSuffix({
  codes: [builderCode]
}) as Hex;

export function encodeClaimBadgeData(referrer: Address) {
  return encodeFunctionData({
    abi: baseBadgeDailyAbi,
    functionName: "claimBadge",
    args: [referrer]
  });
}

export function appendDataSuffix(data: Hex) {
  return concatHex([data, dataSuffix]);
}
