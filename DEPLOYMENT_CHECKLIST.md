# Deployment Checklist

## Before deploy

- Deploy `contracts/BaseBadgeDaily.sol` to Base Mainnet.
- Use constructor base URI ending with `/`, for example `ipfs://.../`.
- Set `NEXT_PUBLIC_CONTRACT_ADDRESS` to the deployed contract.
- Keep `NEXT_PUBLIC_CHAIN_ID=8453`.
- Set `NEXT_PUBLIC_BUILDER_CODE=bc_29s8yo05`.
- Set `NEXT_PUBLIC_BASE_APP_ID` after base.dev verification.
- Set `NEXT_PUBLIC_DATA_SUFFIX=0x62635f32397338796f30350b0080218021802180218021802180218021`.

## Frontend verification

- Mobile layout has no overlapping text or controls.
- Desktop layout uses two balanced columns.
- Wallet choices show only OKX Wallet, MetaMask, and Coinbase Wallet.
- Connected wallet can disconnect.
- `?ref=0x...` is read on the first badge claim.
- Self-referral is ignored in the UI and rejected by the contract.
- Copy Invite Link does not display a full URL on screen.
- Recent Claims refresh after a successful transaction.

## Attribution verification

- Page source contains `<meta name="base:app_id" ...>` and `<meta name="base:builder_code" ...>`.
- All writes use `wagmiConfig` from `lib/wagmi.ts`.
- Basescan transaction input data ends with the configured `NEXT_PUBLIC_DATA_SUFFIX`.
- base.dev Dashboard shows both Offchain and Onchain attribution.
