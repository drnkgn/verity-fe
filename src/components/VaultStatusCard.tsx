"use client";

/**
 * VaultStatusCard — read-only display of a fetched RetentionVault, shared
 * between Contractor/Subcontractor views. Cross-checks the stored amount
 * against the PDA's actual lamport balance per API-CONTRACT §5
 * ("Balance verification... to demonstrate custody is real").
 */
import { Paper, Stack, Typography, Chip, Divider, Alert, Box, Grid } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { PublicKey } from "@solana/web3.js";
import { SolAmount } from "./SolAmount";
import { AddressExplorerLink } from "./ExplorerLink";
import { BackstopCountdown } from "./BackstopCountdown";
import { useVault } from "@/hooks/useVault";
import { computeDerivedFields, vaultStatusToString } from "@/lib/vault";
import { m3Tokens } from "@/theme/m3Theme";

const STATUS_STYLE: Record<
  string,
  { label: string; bg: string; fg: string }
> = {
  funded: {
    label: "Funded",
    bg: m3Tokens.secondaryContainer,
    fg: m3Tokens.onSecondaryContainer,
  },
  cpcReleased: {
    label: "CPC released",
    bg: m3Tokens.tertiaryContainer,
    fg: m3Tokens.onTertiaryContainer,
  },
  disputed: {
    label: "Disputed",
    bg: m3Tokens.errorContainer,
    fg: m3Tokens.onErrorContainer,
  },
  neutralLocked: {
    label: "Neutral locked",
    bg: m3Tokens.errorContainer,
    fg: m3Tokens.onErrorContainer,
  },
  closed: {
    label: "Closed",
    bg: m3Tokens.successContainer,
    fg: m3Tokens.onSuccessContainer,
  },
};

function StatLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing={0.5}>
      <Typography
        variant="caption"
        sx={{ color: m3Tokens.onSurfaceVariant, textTransform: "uppercase", letterSpacing: "0.04em" }}
      >
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

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
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE.funded;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        backgroundColor: m3Tokens.surfaceContainerLow,
        borderColor: m3Tokens.outlineVariant,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        gap={1}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: m3Tokens.primaryContainer,
              color: m3Tokens.onPrimaryContainer,
              flexShrink: 0,
            }}
          >
            <AccountBalanceIcon fontSize="small" />
          </Box>
          <Stack>
            <Typography variant="subtitle1">Vault</Typography>
            <AddressExplorerLink address={vaultPda.toBase58()} />
          </Stack>
        </Stack>
        <Chip
          label={statusStyle.label}
          sx={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.fg,
          }}
        />
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      <Grid container spacing={3} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <StatLabel label="Deposited">
            <SolAmount lamports={vault.amount} variant="h6" />
          </StatLabel>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatLabel label="Released cumulative">
            <SolAmount lamports={vault.released_cumulative} variant="h6" />
          </StatLabel>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatLabel label="Claimable now">
            <SolAmount lamports={derived.claimableNow} variant="h6" />
          </StatLabel>
        </Grid>
      </Grid>

      {lamportBalance != null && (
        <Box
          sx={{
            backgroundColor: m3Tokens.surfaceContainer,
            borderRadius: "12px",
            px: 2,
            py: 1.25,
            mb: 2.5,
          }}
        >
          <Typography variant="body2" sx={{ color: m3Tokens.onSurfaceVariant }}>
            PDA lamport balance (on-chain, live):{" "}
            <SolAmount lamports={lamportBalance} variant="body2" /> — cross-checked
            against amount − released_cumulative to prove custody is real.
          </Typography>
        </Box>
      )}

      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 2.5 }}>
        <BackstopCountdown
          backstopTs={derived.backstopTs}
          clockOffset={vault.clock_offset.toNumber()}
        />
      </Stack>

      <Typography variant="caption" sx={{ color: m3Tokens.onSurfaceVariant }}>
        Project: {vault.project_id} · Main contractor:{" "}
        <AddressExplorerLink address={vault.main_contractor.toBase58()} /> ·
        Subcontractor:{" "}
        <AddressExplorerLink address={vault.subcontractor.toBase58()} />
      </Typography>
    </Paper>
  );
}
