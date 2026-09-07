"use client";

/**
 * VaultSessionContext — holds the current demo session's project identity
 * (project_id + subcontractor/main_contractor pubkeys) so Contractor, Subcontractor,
 * and Demo Control views all derive the *same* vault PDA during a rehearsal.
 *
 * Persisted to localStorage so a page refresh mid-demo doesn't lose the session.
 * Per DEMO-PLAN risk #9 (PDA reseed between rehearsals), changing project_id here
 * is the supported way to get a fresh PDA for a re-run.
 */
import { PublicKey } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { deriveVaultPda } from "@/lib/pda";

const STORAGE_KEY = "verita.vaultSession.v1";

export interface VaultSessionState {
  projectId: string;
  subcontractor: string; // base58 pubkey string
  mainContractor: string; // base58 pubkey string
  certifier: string;
  adjudicator: string;
  demoAuthority: string;
}

const DEFAULT_SESSION: VaultSessionState = {
  projectId: "",
  subcontractor: "",
  mainContractor: "",
  certifier: "",
  adjudicator: "",
  demoAuthority: "",
};

interface VaultSessionContextValue {
  session: VaultSessionState;
  setSession: (session: VaultSessionState) => void;
  resetSession: (newProjectId?: string) => void;
  vaultPda: PublicKey | null;
  vaultPdaError: string | null;
}

const VaultSessionContext = createContext<VaultSessionContextValue | null>(
  null
);

function safeParsePublicKey(value: string): PublicKey | null {
  if (!value) return null;
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

function loadInitialSession(): VaultSessionState {
  if (typeof window === "undefined") return DEFAULT_SESSION;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SESSION;
    return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SESSION;
  }
}

export function VaultSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lazy initializer reads localStorage synchronously on first render —
  // no effect needed, avoiding a cross-render setState-in-effect.
  const [session, setSessionState] =
    useState<VaultSessionState>(loadInitialSession);

  const setSession = (next: VaultSessionState) => {
    setSessionState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const resetSession = (newProjectId?: string) => {
    const next: VaultSessionState = {
      ...DEFAULT_SESSION,
      projectId:
        newProjectId ?? `demo-${Date.now().toString(36)}`,
    };
    setSession(next);
  };

  const { vaultPda, vaultPdaError } = useMemo(() => {
    const sub = safeParsePublicKey(session.subcontractor);
    const contractor = safeParsePublicKey(session.mainContractor);
    if (!session.projectId || !sub || !contractor) {
      return { vaultPda: null, vaultPdaError: null };
    }
    try {
      const [pda] = deriveVaultPda(session.projectId, sub, contractor);
      return { vaultPda: pda, vaultPdaError: null };
    } catch (err) {
      return {
        vaultPda: null,
        vaultPdaError:
          err instanceof Error ? err.message : "Failed to derive vault PDA.",
      };
    }
  }, [session.projectId, session.subcontractor, session.mainContractor]);

  return (
    <VaultSessionContext.Provider
      value={{ session, setSession, resetSession, vaultPda, vaultPdaError }}
    >
      {children}
    </VaultSessionContext.Provider>
  );
}

export function useVaultSession(): VaultSessionContextValue {
  const ctx = useContext(VaultSessionContext);
  if (!ctx) {
    throw new Error(
      "useVaultSession must be used within a VaultSessionProvider."
    );
  }
  return ctx;
}
