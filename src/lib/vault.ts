/**
 * RetentionVault types + derived fields — API-CONTRACT-retention.md §2.
 *
 * Field names are snake_case, matching the IDL literally: Anchor 0.30's
 * Borsh account coder does not camelCase decoded field names, so the object
 * returned by `program.account.RetentionVault.fetch()` has exactly the field
 * names declared in specs/tahan.idl.json / src/lib/idl/tahan.ts.
 */
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { SECONDS_PER_DAY } from "./constants";

export type VaultStatus =
  | "funded"
  | "cpcReleased"
  | "disputed"
  | "neutralLocked"
  | "closed";

/** Raw on-chain account shape as decoded by the Anchor client (snake_case per IDL). */
export interface RetentionVaultAccount {
  main_contractor: PublicKey;
  subcontractor: PublicKey;
  certifier: PublicKey;
  adjudicator: PublicKey;
  demo_authority: PublicKey;
  rent_payer: PublicKey;
  mint: PublicKey;
  project_id: string;
  amount: BN;
  released_cumulative: BN;
  practical_completion_ts: BN;
  dlp_days: number;
  grace_days: number;
  release_schedule_bps: number;
  cpc_attested: boolean;
  aggregate_frozen: BN;
  active_freeze_count: number;
  aggregate_freeze_cap: BN;
  max_active_freezes: number;
  clock_offset: BN;
  status: {
    Funded?: object;
    CpcReleased?: object;
    Disputed?: object;
    NeutralLocked?: object;
    Closed?: object;
  };
  bump: number;
}

export function vaultStatusToString(
  status: RetentionVaultAccount["status"]
): VaultStatus {
  if (status.Funded) return "funded";
  if (status.CpcReleased) return "cpcReleased";
  if (status.Disputed) return "disputed";
  if (status.NeutralLocked) return "neutralLocked";
  if (status.Closed) return "closed";
  return "funded";
}

export interface DerivedVaultFields {
  effectiveTs: number;
  backstopTs: number;
  dlpCloseTs: number;
  claimableNow: BN;
  isClaimable: boolean;
}

/**
 * Compute derived fields client-side per API-CONTRACT §2:
 *   effective_ts = clock.unix_timestamp + clock_offset
 *   backstop_ts = practical_completion_ts + dlp_days*86400 + grace_days*86400
 *   dlp_close_ts = practical_completion_ts + dlp_days*86400
 *   claimable_now = amount - released_cumulative - aggregate_frozen
 *   is_claimable = effective_ts >= backstop_ts && claimable_now > 0
 */
export function computeDerivedFields(
  vault: RetentionVaultAccount,
  nowUnixSeconds: number = Math.floor(Date.now() / 1000)
): DerivedVaultFields {
  const effectiveTs = nowUnixSeconds + vault.clock_offset.toNumber();
  const practicalCompletionTs = vault.practical_completion_ts.toNumber();
  const backstopTs =
    practicalCompletionTs +
    vault.dlp_days * SECONDS_PER_DAY +
    vault.grace_days * SECONDS_PER_DAY;
  const dlpCloseTs = practicalCompletionTs + vault.dlp_days * SECONDS_PER_DAY;

  const claimableNow = vault.amount
    .sub(vault.released_cumulative)
    .sub(vault.aggregate_frozen);

  const isClaimable = effectiveTs >= backstopTs && claimableNow.gtn(0);

  return { effectiveTs, backstopTs, dlpCloseTs, claimableNow, isClaimable };
}
