"use client";

/**
 * Demo Control panel — FE-3.
 *   - Operator advances clock_offset via advance_clock (demo-only, feature-gated).
 *   - Per API-CONTRACT §4: "frontend should also handle the absence of
 *     advance_clock gracefully (production build): if the instruction isn't
 *     in the IDL, hide the Demo Control panel." Enforced by hasDemoClockInstruction()
 *     both here and in the nav (AppHeader).
 *   - Reset/redeploy helper: DEMO-PLAN risk #9 — PDAs are deterministic per
 *     (project, sub, contractor) seeds, so a re-run with the same seeds hits
 *     an already-initialized account. The helper varies the project_id seed
 *     per run via VaultSessionForm's "Reset session" button.
 */
import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import ScheduleIcon from "@mui/icons-material/Schedule";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { VaultSessionForm } from "@/components/VaultSessionForm";
import { VaultStatusCard } from "@/components/VaultStatusCard";
import { TxExplorerLink } from "@/components/ExplorerLink";
import { PageHeader } from "@/components/PageHeader";
import { useVaultSession } from "@/hooks/useVaultSession";
import { useVault } from "@/hooks/useVault";
import { getProgram, hasDemoClockInstruction } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { m3Tokens } from "@/theme/m3Theme";

export default function DemoControlPage() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { session, vaultPda } = useVaultSession();
  const { vault, refetch } = useVault(vaultPda);

  const [offsetSeconds, setOffsetSeconds] = useState("0");
  const [busy, setBusy] = useState(false);
  const [txResult, setTxResult] = useState<{ ok: boolean; message: string; signature?: string } | null>(null);

  const demoEnabled = hasDemoClockInstruction();

  if (!demoEnabled) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="warning">
          Demo Control is unavailable — this build&apos;s IDL does not expose
          advance_clock. This is a production build; the demo clock is
          compiled out.
        </Alert>
      </Container>
    );
  }

  const canAdvance =
    anchorWallet &&
    vaultPda &&
    vault &&
    session.demoAuthority &&
    anchorWallet.publicKey.equals(new PublicKey(session.demoAuthority));

  const handleAdvance = async () => {
    if (!canAdvance || !anchorWallet || !vaultPda) return;
    setBusy(true);
    setTxResult(null);
    try {
      const program = getProgram(connection, anchorWallet);
      const newOffset = new BN(
        vault
          ? vault.clock_offset.toNumber() + parseInt(offsetSeconds, 10)
          : parseInt(offsetSeconds, 10)
      );

      const signature = await program.methods
        .advance_clock(newOffset)
        .accounts({
          demo_authority: anchorWallet.publicKey,
          vault: vaultPda,
        })
        .rpc();

      setTxResult({ ok: true, message: "Clock advanced.", signature });
      refetch();
    } catch (err) {
      setTxResult({
        ok: false,
        message: err instanceof Error ? err.message : "Failed to advance clock.",
      });
    } finally {
      setBusy(false);
    }
  };

  const jumpToBackstop = () => {
    if (!vault) return;
    const practicalCompletionTs = vault.practical_completion_ts.toNumber();
    const backstopTs =
      practicalCompletionTs + vault.dlp_days * 86400 + vault.grace_days * 86400;
    const nowTs = Math.floor(Date.now() / 1000);
    setOffsetSeconds(String(backstopTs - nowTs + 5));
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <PageHeader
        icon={TuneIcon}
        title="Demo Control"
        description="Operator-only. Advances the vault's clock_offset so the backstop can be crossed live on stage. This instruction only exists in demo/feature-gated builds — it must be absent from production."
        accent={m3Tokens.secondaryContainer}
        onAccent={m3Tokens.onSecondaryContainer}
      />

      <VaultSessionForm />

      <VaultStatusCard vaultPda={vaultPda} />

      <Paper
        variant="outlined"
        sx={{ p: 3, mt: 2.5, mb: 2.5, backgroundColor: m3Tokens.surfaceContainerLow }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: m3Tokens.secondaryContainer,
              color: m3Tokens.onSecondaryContainer,
            }}
          >
            <ScheduleIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1">Advance clock</Typography>
        </Stack>
        <Stack spacing={2}>
          <TextField
            label="New clock_offset (seconds)"
            type="number"
            size="small"
            value={offsetSeconds}
            onChange={(e) => setOffsetSeconds(e.target.value)}
            helperText="Absolute clock_offset value to set, not a delta."
          />
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" onClick={jumpToBackstop} disabled={!vault}>
              Fill offset to reach backstop
            </Button>
            <Button
              variant="contained"
              color="secondary"
              disabled={!canAdvance || busy}
              onClick={handleAdvance}
            >
              {busy ? "Advancing…" : "Advance clock"}
            </Button>
          </Stack>
          {!canAdvance && anchorWallet && (
            <Alert severity="warning">
              Connected wallet must match the demo_authority pubkey set above.
            </Alert>
          )}
          {txResult && (
            <Alert severity={txResult.ok ? "success" : "error"}>
              {txResult.message}
              {txResult.signature && (
                <>
                  {" "}
                  <TxExplorerLink signature={txResult.signature} />
                </>
              )}
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: 3, backgroundColor: m3Tokens.surfaceContainer, borderColor: "transparent" }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: m3Tokens.surfaceContainerHighest,
              color: m3Tokens.onSurfaceVariant,
            }}
          >
            <RestartAltIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1">Reset for a clean re-run</Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: m3Tokens.onSurfaceVariant }}>
          PDAs are deterministic per (project_id, subcontractor,
          main_contractor). Re-running the demo against the same project ID
          will hit an already-initialized vault. Use &quot;Reset session (new
          project ID)&quot; above to generate a fresh seed before each
          rehearsal.
        </Typography>
      </Paper>
    </Container>
  );
}
