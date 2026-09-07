"use client";

/**
 * useVault — fetches a RetentionVault account and keeps it live via
 * connection.onAccountChange, per API-CONTRACT-retention.md §5 read patterns:
 *   "Live updates: connection.onAccountChange(vaultPda, ...) to re-render
 *    balance/countdown without polling. This is the 'verify it yourself,
 *    any time' value prop."
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { getReadOnlyProgram } from "@/lib/program";
import type { RetentionVaultAccount } from "@/lib/vault";

export interface UseVaultResult {
  vault: RetentionVaultAccount | null;
  lamportBalance: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVault(vaultPda: PublicKey | null): UseVaultResult {
  const { connection } = useConnection();
  const [vault, setVault] = useState<RetentionVaultAccount | null>(null);
  const [lamportBalance, setLamportBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionIdRef = useRef<number | null>(null);

  const fetchVault = useCallback(async () => {
    if (!vaultPda) {
      setVault(null);
      setLamportBalance(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const program = getReadOnlyProgram(connection);
      const [account, balance] = await Promise.all([
        program.account.RetentionVault.fetch(
          vaultPda
        ) as unknown as Promise<RetentionVaultAccount>,
        connection.getBalance(vaultPda),
      ]);
      setVault(account);
      setLamportBalance(balance);
    } catch (err) {
      // Account not found (not yet funded) is an expected state, not a hard error.
      setVault(null);
      setLamportBalance(null);
      setError(err instanceof Error ? err.message : "Failed to fetch vault.");
    } finally {
      setLoading(false);
    }
  }, [connection, vaultPda]);

  // Fetch on mount / whenever the target PDA changes. The fetch itself is
  // async (setState calls happen after the network round-trip), but kicking
  // it off is done via a microtask so React doesn't see a synchronous
  // setState call inside the effect body itself.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVault();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [fetchVault]);

  // Live account subscription — balance/status/countdown update without polling.
  useEffect(() => {
    if (!vaultPda) return;

    const id = connection.onAccountChange(
      vaultPda,
      () => {
        fetchVault();
      },
      { commitment: "confirmed" }
    );
    subscriptionIdRef.current = id;

    return () => {
      if (subscriptionIdRef.current !== null) {
        connection.removeAccountChangeListener(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [connection, vaultPda, fetchVault]);

  return { vault, lamportBalance, loading, error, refetch: fetchVault };
}
