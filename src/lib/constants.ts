/**
 * Shared constants — single source of truth per API-CONTRACT-retention.md §0.
 *
 * Program ID: placeholder until BE-1 deploys. Read from the IDL, not hardcoded elsewhere.
 * RPC endpoints: per DEMO-PLAN-retention.md risk #2, pin a provider endpoint as primary
 * with api.devnet.solana.com as fallback. Set NEXT_PUBLIC_SOLANA_RPC_URL to override.
 */
import { PublicKey } from "@solana/web3.js";
import { TAHAN_IDL } from "./idl/tahan";

export const PROGRAM_ID = new PublicKey(TAHAN_IDL.address);

export const DEVNET_FALLBACK_RPC = "https://api.devnet.solana.com";

/** Primary RPC endpoint. Falls back to the public devnet RPC if no provider key is configured. */
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || DEVNET_FALLBACK_RPC;

export const CLUSTER = "devnet" as const;

/**
 * Illustrative-only SOL -> MYR display multiplier. Frontend-only static constant;
 * never stored or read on-chain. Per API-CONTRACT §0 and DEMO-PLAN risk #5, must be
 * labeled "illustrative rate, demo only" wherever rendered.
 */
export const MYR_PER_SOL = 500;

export const LAMPORTS_PER_SOL = 1_000_000_000;

export const SECONDS_PER_DAY = 86_400;

/** PDA seed literal for the retention_vault account, per API-CONTRACT §1. */
export const VAULT_SEED = "vault";

/** PDA seed literal for freeze accounts (STRETCH), per API-CONTRACT §1. */
export const FREEZE_SEED = "freeze";

/** Explorer link helpers (devnet cluster), per API-CONTRACT §5. */
export const explorerTxUrl = (signature: string) =>
  `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

export const explorerAddressUrl = (address: string) =>
  `https://explorer.solana.com/address/${address}?cluster=devnet`;
