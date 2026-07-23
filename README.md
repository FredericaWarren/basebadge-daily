# BaseBadge Daily

BaseBadge Daily is a mobile-first Base Mini App for claiming non-transferable ERC721 proof badges.

## Stack

- Next.js App Router
- TypeScript
- Wagmi native config
- Viem
- Tailwind CSS
- Solidity `^0.8.20`
- OpenZeppelin ERC721Enumerable

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_BUILDER_CODE=bc_29s8yo05
NEXT_PUBLIC_BASE_APP_ID=...
NEXT_PUBLIC_DATA_SUFFIX=0x62635f32397338796f30350b0080218021802180218021802180218021
```

The first launch can use placeholders. After base.dev verification, update `NEXT_PUBLIC_BASE_APP_ID` and `NEXT_PUBLIC_DATA_SUFFIX`, then redeploy without changing the Vercel project URL.

## Contract

Source: `contracts/BaseBadgeDaily.sol`

Constructor:

```solidity
constructor(string memory initialBaseURI)
```

Primary user action:

```solidity
claimBadge(address referrer)
```

The badge is Soulbound. `transferFrom` and `safeTransferFrom` revert, and `_update` blocks non-mint transfers.

Recommended deploy settings:

- Network: Base Mainnet
- Solidity: `^0.8.20`
- EVM version: `paris`
- Value: `0`

## App Checks

Run locally:

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Verify before submitting to base.dev:

- `base:app_id` and `base:builder_code` exist in `app/layout.tsx` inside `<head>`.
- `lib/wagmi.ts` includes `dataSuffix`.
- Only OKX Wallet, MetaMask, and Coinbase Wallet buttons are visible.
- Invite links are copied to clipboard, not displayed on the page.
- Claim transactions call `claimBadge(address referrer)`.
- Basescan transaction input data ends with `NEXT_PUBLIC_DATA_SUFFIX`.

## Deploy

Create a GitHub repository named `basebadge-daily`, push this project, then import the repository into Vercel with the same project name.

Vercel build command:

```bash
npm run build
```

Vercel headers are configured in `vercel.json` to allow iframe embedding.
