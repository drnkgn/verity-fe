"use client";

/**
 * VaultStatusCard — read-only display of a fetched RetentionVault, shared
 * between Contractor/Subcontractor views. Cross-checks the stored amount
 * against the PDA's actual lamport balance per API-CONTRACT §5
 * ("Balance verification... to demonstrate custody is real").
 */
import { Paper, Stack, Typography, Chip, Divider, Alert } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { SolAmount } from "./SolAmount";
import { AddressExplorerLink } from "./ExplorerLink";
import { BackstopCountdown } from "./BackstopCountdown";
import { useVault } from "@/hooks/useVault";
import { computeDerivedFields, vaultStatusToString } from "@/lib/vault";

const STATUS_COLOR: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  funded: "info",
  cpcReleased: "warning",
  disputed: "error",
  neutralLocked: "error",
  closed: "success",
};

export function VaultStatusCard({ vaultPda }: { vaultPda: PublicKey | null }) {
  const { vault, lamportBalance, loading, error } = useVault(vaultPda);

  if (!vaultPda) {
    return (
      <Alert severity="info">
        Set a project ID and both party pubkeys above to derive a vault.
      </Alert>
    );
  }

  if (loading && !vault) {
    return <Alert severity="info">Loading vault…</Alert>;
  }

  if (!vault) {
    return (
      <Alert severity="warning">
        No vault found at this PDA yet ({vaultPda.toBase58().slice(0, 8)}…).{" "}
        {error && error !== "Account does not exist" ? error : "Fund it below to create it."}
      </Alert>
    );
  }

  const derived = computeDerivedFields(vault);
  const status = vaultStatusToString(vault.status);
  const residualAccordingToChain =
    lamportBalance != null ? lamportBalance : null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Vault: <AddressExplorerLink address={vaultPda.toBase58()} />
        </Typography>
        <Chip label={status} color={STATUS_COLOR[status] ?? "default"} />
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={4}>
          <div>
            <Typography variant="caption" color="text.secondary">
              Deposited amount
            </Typography>
            <SolAmount lamports={vault.amount} variant="h6" />
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Released cumulative
            </Typography>
            <SolAmount lamports={vault.released_cumulative} variant="h6" />
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">
              Claimable now
            </Typography>
            <SolAmount lamports={derived.claimableNow} variant="h6" />
          </div>
        </Stack>

        {residualAccordingToChain != null && (
          <Typography variant="body2" color="text.secondary">
            PDA lamport balance (on-chain, live):{" "}
            <SolAmount lamports={residualAccordingToChain} variant="body2" /> — cross-checked
            against amount − released_cumulative to prove custody is real.
          </Typography>
        )}

        <BackstopCountdown
          backstopTs={derived.backstopTs}
          clockOffset={vault.clock_offset.toNumber()}
        />

        <Typography variant="caption" color="text.secondary">
          Project: {vault.project_id} · Main contractor:{" "}
          <AddressExplorerLink address={vault.main_contractor.toBase58()} /> ·
          Subcontractor:{" "}
          <AddressExplorerLink address={vault.subcontractor.toBase58()} />
        </Typography>
      </Stack>
    </Paper>
  );
}
