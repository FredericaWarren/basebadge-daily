"use client";

import { LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortAddress } from "@/lib/env";
import { hasInjectedWallet, walletOptions } from "@/lib/wagmi";

export function WalletChooser() {
  const { address, connector, isConnected } = useAccount();
  const { connectAsync, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState("");

  async function connectWallet(option: (typeof walletOptions)[number]) {
    setError("");
    if (option.id !== "coinbase" && !hasInjectedWallet(option.id)) {
      setError(`Open in ${option.label} or install ${option.label}.`);
      return;
    }

    try {
      await connectAsync({ connector: option.connector });
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : "";
      const missingProvider = detail.toLowerCase().includes("provider") || detail.toLowerCase().includes("not found");
      setError(missingProvider ? `Open in ${option.label} or install ${option.label}.` : detail || "Connection failed.");
    }
  }

  if (isConnected) {
    return (
      <div className="subpanel p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Connected wallet</p>
            <p className="mt-1 truncate text-sm font-bold text-[#302b25]">{shortAddress(address)}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-[#8a826f]">{connector?.name}</p>
          </div>
          <button className="icon-button shrink-0" type="button" onClick={() => disconnect()} aria-label="Disconnect wallet">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {walletOptions.map((option) => (
          <button
            className="wallet-button"
            type="button"
            key={option.id}
            onClick={() => connectWallet(option)}
            disabled={isPending}
          >
            <Wallet size={17} />
            <span>{isPending ? "Connecting" : option.label}</span>
          </button>
        ))}
      </div>
      {error ? <p className="status-error">{error}</p> : null}
    </div>
  );
}
