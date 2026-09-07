/**
 * PDA derivations — API-CONTRACT-retention.md §1.
 */
import { PublicKey } from "@solana/web3.js";
import { sha256 } from "js-sha256";
import { PROGRAM_ID, VAULT_SEED, FREEZE_SEED } from "./constants";

/**
 * retention_vault seeds = ["vault", sha256(project_id) (32b), subcontractor, main_contractor].
 * project_id is hashed to a fixed 32 bytes; both sides must hash the same bytes
 * (UTF-8, no trailing null, no normalization).
 */
export function deriveVaultPda(
  projectId: string,
  subcontractor: PublicKey,
  mainContractor: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  const projectHash = Buffer.from(sha256.arrayBuffer(projectId));
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(VAULT_SEED),
      projectHash,
      subcontractor.toBuffer(),
      mainContractor.toBuffer(),
    ],
    programId
  );
}

/**
 * freeze seeds = ["freeze", vault (32b), freeze_id (u32 le)] — STRETCH.
 */
export function deriveFreezePda(
  vault: PublicKey,
  freezeId: number,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  const freezeIdBuf = Buffer.alloc(4);
  freezeIdBuf.writeUInt32LE(freezeId, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(FREEZE_SEED), vault.toBuffer(), freezeIdBuf],
    programId
  );
}
