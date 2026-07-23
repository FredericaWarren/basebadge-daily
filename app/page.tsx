"use client";

import { Award, BadgeCheck, Copy, FileText, Loader2, Medal, Sparkles, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, parseAbiItem, zeroAddress, type Address } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContracts,
  useSendCalls,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { WalletChooser } from "@/components/WalletChooser";
import { appendDataSuffix, dataSuffix, encodeClaimBadgeData } from "@/lib/attribution";
import { baseBadgeDailyAbi } from "@/lib/baseBadgeDailyAbi";
import { chainId, contractAddress, hasContractAddress, normalizeAddress, shortAddress } from "@/lib/env";

type ClaimLog = {
  tokenId: bigint;
  pointsAwarded: bigint;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
};

const claimEvent = parseAbiItem(
  "event BadgeClaimed(address indexed user, uint256 indexed tokenId, uint256 pointsAwarded, address indexed referrer)"
);

function formatNumber(value: unknown) {
  if (typeof value !== "bigint") return "0";
  return Number(formatUnits(value, 0)).toLocaleString("en-US");
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [message, setMessage] = useState("");
  const [recentClaims, setRecentClaims] = useState<ClaimLog[]>([]);
  const [copied, setCopied] = useState(false);
  const [isCallsRefreshing, setIsCallsRefreshing] = useState(false);
  const referrer = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const candidate = normalizeAddress(new URLSearchParams(window.location.search).get("ref"));
    return candidate && candidate !== address ? candidate : undefined;
  }, [address]);

  const reads = useReadContracts({
    allowFailure: true,
    query: {
      enabled: hasContractAddress,
      refetchInterval: 12_000
    },
    contracts: [
      {
        address: contractAddress,
        abi: baseBadgeDailyAbi,
        functionName: "totalBadges"
      },
      {
        address: contractAddress,
        abi: baseBadgeDailyAbi,
        functionName: "userStats",
        args: [address ?? zeroAddress]
      },
      {
        address: contractAddress,
        abi: baseBadgeDailyAbi,
        functionName: "claimingPaused"
      }
    ]
  });

  const totalBadges = reads.data?.[0]?.result;
  const userStats = reads.data?.[1]?.result;
  const claimingPaused = reads.data?.[2]?.result === true;
  const badgeCount = Array.isArray(userStats) ? userStats[0] : 0n;
  const rewardPoints = Array.isArray(userStats) ? userStats[1] : 0n;
  const savedReferrer = Array.isArray(userStats) ? (userStats[2] as Address) : zeroAddress;
  const activeReferrer = savedReferrer !== zeroAddress ? savedReferrer : referrer ?? zeroAddress;

  const { sendCallsAsync, isPending: isCallsPromptOpen } = useSendCalls();
  const { sendTransactionAsync, data: claimHash, isPending: isTransactionPromptOpen } = useSendTransaction();
  const receipt = useWaitForTransactionReceipt({ hash: claimHash });
  const isConfirming = receipt.isLoading || isCallsRefreshing;

  async function loadRecentClaims() {
    if (!publicClient || !address || !hasContractAddress) {
      setRecentClaims([]);
      return;
    }

    const latest = await publicClient.getBlockNumber();
    const fromBlock = latest > 120_000n ? latest - 120_000n : 0n;
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: claimEvent,
      args: { user: address },
      fromBlock,
      toBlock: "latest"
    });

    setRecentClaims(
      logs
        .slice(-5)
        .reverse()
        .map((log) => ({
          tokenId: log.args.tokenId ?? 0n,
          pointsAwarded: log.args.pointsAwarded ?? 0n,
          blockNumber: log.blockNumber ?? 0n,
          transactionHash: log.transactionHash
        }))
    );
  }

  async function claimBadge() {
    setMessage("");
    if (!isConnected) {
      setMessage("Connect a wallet to claim your badge.");
      return;
    }
    if (!hasContractAddress) {
      setMessage("Contract address is not configured yet.");
      return;
    }

    try {
      const callData = encodeClaimBadgeData(activeReferrer);

      try {
        await sendCallsAsync({
          chainId,
          calls: [{ to: contractAddress, data: callData }],
          capabilities: { dataSuffix: { value: dataSuffix } },
          experimental_fallback: true
        });
        setMessage("Badge claim submitted.");
        setIsCallsRefreshing(true);
        window.setTimeout(() => {
          void reads.refetch();
          void loadRecentClaims().catch(() => setRecentClaims([]));
          setIsCallsRefreshing(false);
        }, 4_000);
        return;
      } catch {
        await sendTransactionAsync({
          to: contractAddress,
          data: appendDataSuffix(callData)
        });
      }
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Claim failed.");
    }
  }

  async function copyInviteLink() {
    if (!address || typeof window === "undefined") return;
    const invite = `${window.location.origin}${window.location.pathname}?ref=${address}`;
    await navigator.clipboard.writeText(invite);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  useEffect(() => {
    void loadRecentClaims().catch(() => setRecentClaims([]));
  }, [address, publicClient]);

  useEffect(() => {
    if (receipt.isSuccess) {
      setMessage("Badge claimed.");
      void reads.refetch();
      void loadRecentClaims().catch(() => setRecentClaims([]));
    }
  }, [receipt.isSuccess]);

  const claimLabel = !isConnected
    ? "Connect Wallet"
    : isCallsPromptOpen || isTransactionPromptOpen
      ? "Waiting for Wallet"
      : isConfirming
        ? "Confirming"
        : "Claim Badge";

  return (
    <main className="shell">
      <section className="space-y-5">
        <header className="paper-panel overflow-hidden" id="claim">
          <div className="px-5 pb-5 pt-6 sm:px-6 sm:pt-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Badge Drawer</p>
                <h1 className="editorial-title mt-2">BaseBadge Daily</h1>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#746c5d]">Claim proof. Build your streak.</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#cad6bd] bg-[#eef4e7] px-3 py-1.5 text-xs font-bold text-[#526844]">
                Base
              </span>
            </div>

            <WalletChooser />
          </div>
        </header>

        <section className="paper-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Today&apos;s Proof</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#302b25]">Claim a keepsake badge</h2>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#d9cbb5] bg-[#f4ead8] text-[#9a6a2f]">
              <BadgeCheck size={21} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="stat-card">
              <p className="eyebrow">Badges Claimed</p>
              <p className="mt-3 text-3xl font-black text-[#302b25] sm:text-4xl">{formatNumber(badgeCount)}</p>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Reward Points</p>
              <p className="mt-3 text-3xl font-black text-[#b9853f] sm:text-4xl">{formatNumber(rewardPoints)}</p>
            </div>
            <div className="stat-card">
              <p className="eyebrow">Total Badges</p>
              <p className="mt-3 text-3xl font-black text-[#302b25] sm:text-4xl">{formatNumber(totalBadges)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <button
              className="primary-button"
              type="button"
              onClick={claimBadge}
              disabled={isCallsPromptOpen || isTransactionPromptOpen || isConfirming || claimingPaused}
            >
              {isCallsPromptOpen || isTransactionPromptOpen || isConfirming ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Sparkles size={18} />
              )}
              {claimingPaused ? "Claiming Paused" : claimLabel}
            </button>

            {message ? <p className={receipt.isSuccess ? "status-success" : "status-error"}>{message}</p> : null}

            <div className="subpanel p-4">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 shrink-0 text-[#8e7958]" size={18} />
                <div className="min-w-0">
                  <p className="eyebrow">Contract</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#302b25]">{shortAddress(contractAddress)}</p>
                  <p className="mt-1 text-xs font-medium text-[#8a826f]">
                    {hasContractAddress ? "Base Mainnet badge contract" : "Contract address unavailable"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="paper-card p-5 sm:p-6" id="badges">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Recent Claims</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-[#302b25]">Badge ledger</h2>
            </div>
            <Award className="text-[#7b8a63]" size={24} />
          </div>

          <div className="space-y-2">
            {recentClaims.length ? (
              recentClaims.map((claim) => (
                <div className="subpanel flex items-center justify-between gap-3 p-3" key={claim.transactionHash}>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dcc6a5] bg-[#f4ead8] text-[#a97834]">
                      <Medal size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#302b25]">Badge #{claim.tokenId.toString()}</p>
                      <p className="truncate text-xs font-medium text-[#8a826f]">Block {claim.blockNumber.toString()}</p>
                    </div>
                  </div>
                  <p className="shrink-0 rounded-full bg-[#eef4e7] px-2.5 py-1 text-xs font-black text-[#596d45]">
                    +{claim.pointsAwarded.toString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="subpanel grid min-h-32 place-items-center p-5 text-center">
                <div>
                  <Trophy className="mx-auto text-[#aaa18f]" size={30} />
                  <p className="mt-3 text-sm font-bold text-[#746c5d]">No claims yet</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="paper-card p-5 sm:p-6" id="invite">
          <div className="mb-4">
            <p className="eyebrow">Invite</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#302b25]">Share your drawer</h2>
          </div>
          <div className="subpanel mb-3 p-4">
            <p className="eyebrow">Referrer</p>
            <p className="mt-2 truncate text-sm font-bold text-[#302b25]">
              {activeReferrer === zeroAddress ? "None" : shortAddress(activeReferrer)}
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={copyInviteLink} disabled={!address}>
            <Copy size={17} />
            {copied ? "Copied" : "Copy Invite Link"}
          </button>
        </section>
      </section>

      <nav className="bottom-nav">
        <a className="bottom-nav-link" href="#claim">
          Home
        </a>
        <a className="bottom-nav-link" href="#badges">
          Activity
        </a>
        <a className="bottom-nav-link" href="#invite">
          Invite
        </a>
        <a className="bottom-nav-link" href="#claim">
          Profile
        </a>
      </nav>
    </main>
  );
}
