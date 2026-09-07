/**
 * Shared typed Anchor client — builds an anchor.Program<TahanIdl> against a connection
 * + wallet. Frontend code should go through this module rather than constructing
 * Program instances ad hoc, per SPECIFICATIONS.md §4.2 / DEMO-PLAN FE-1.
 */
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  Keypair,
  type Connection,
  type Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { TAHAN_IDL } from "./idl/tahan";

/**
 * TAHAN_IDL is declared `as const` so Anchor's generated method/account
 * namespaces get camelCase literal types (program.methods.fundVault(...),
 * program.account.retentionVault.fetch(...)). That makes its runtime shape
 * deeply `readonly`, which structurally satisfies but does not nominally
 * match Anchor's mutable `Idl` type at the generic-constraint level.
 * `Mutable` recursively strips `readonly` for the constraint check only —
 * it preserves the literal string types Anchor relies on for camelCase
 * method/account name generation.
 */
type Mutable<T> = T extends readonly [infer Head, ...infer Tail]
  ? [Mutable<Head>, ...Mutable<Tail>]
  : T extends readonly (infer U)[]
    ? Mutable<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Mutable<T[K]> }
      : T;

export type TahanIdl = Mutable<typeof TAHAN_IDL>;

const IDL_FOR_PROGRAM = TAHAN_IDL as unknown as TahanIdl;

export function getProgram(
  connection: Connection,
  wallet: AnchorWallet
): Program<TahanIdl> {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  return new Program<TahanIdl>(IDL_FOR_PROGRAM, provider);
}

/**
 * Read-only program instance for fetching accounts without a connected wallet
 * (e.g. before wallet connect, or for the "verify it yourself" read-only flow).
 * Backed by a throwaway keypair that is never used to sign real transactions.
 */
export function getReadOnlyProgram(connection: Connection): Program<TahanIdl> {
  const throwawayKeypair = Keypair.generate();
  const readOnlyWallet: AnchorWallet = {
    publicKey: throwawayKeypair.publicKey,
    signTransaction: async <
      T extends Transaction | VersionedTransaction,
    >(): Promise<T> => {
      throw new Error("Read-only client cannot sign transactions.");
    },
    signAllTransactions: async <
      T extends Transaction | VersionedTransaction,
    >(): Promise<T[]> => {
      throw new Error("Read-only client cannot sign transactions.");
    },
  };
  const provider = new AnchorProvider(connection, readOnlyWallet, {
    commitment: "confirmed",
  });
  return new Program<TahanIdl>(IDL_FOR_PROGRAM, provider);
}

/** True if the deployed/loaded IDL exposes advance_clock (demo build). Per API-CONTRACT §4. */
export function hasDemoClockInstruction(): boolean {
  return TAHAN_IDL.instructions.some((ix) => ix.name === "advance_clock");
}
