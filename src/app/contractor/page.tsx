"use client";

/**
 * Contractor view — FE-2.
 *   - Create + fund_vault.
 *   - "Try to withdraw" button surfacing the program's structural refusal:
 *     there is no contractor-withdrawal instruction in the IDL at all, so
 *     this demonstrates the refusal by construction rather than by a
 *     failing transaction.
 * Per API-CONTRACT §3 fund_vault and DEMO-PLAN FE-2 / risk #8 (say aloud
 * this is the backstop path, not certification, when relevant).
 */
import { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  Grid,
  Box,
} from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import SavingsIcon from "@mui/icons-material/Savings";
import BlockIcon from "@mui/icons-material/Block";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { VaultSessionForm } from "@/components/VaultSessionForm";
import { VaultStatusCard } from "@/components/VaultStatusCard";
import { TxExplorerLink } from "@/components/ExplorerLink";
import { PageHeader } from "@/components/PageHeader";
import { useVaultSession } from "@/hooks/useVaultSession";
import { getProgram } from "@/lib/program";
import { LAMPORTS_PER_SOL } from "@/lib/constants";
import { m3Tokens } from "@/theme/m3Theme";

interface FundForm {
  amountSol: string;
  practicalCompletionDate: string; // yyyy-mm-dd
  dlpDays: string;
  graceDays: string;
  releaseScheduleBps: string;
}

const DEFAULT_FORM: FundForm = {
  amountSol: "1",
  practicalCompletionDate: new Date().toISOString().slice(0, 10),
  dlpDays: "0",
  graceDays: "0",
  releaseScheduleBps: "5000",
};

export default function ContractorPage() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { session, vaultPda } = useVaultSession();

  const [form, setForm] = useState<FundForm>(DEFAULT_FORM);
  const [busy, setBusy] = useState(false);
  const [txResult, setTxResult] = useState<{ ok: boolean; message: string; signature?: string } | null>(null);

  const subcontractorPk = useMemo(() => {
    try {
      return new PublicKey(session.subcontractor);
    } catch {
      return null;
    }
  }, [session.subcontractor]);

  const canFund =
    connected &&
    anchorWallet &&
    vaultPda &&
    subcontractorPk &&
    session.certifier &&
    session.adjudicator &&
    session.demoAuthority;

  const handleFund = async () => {
    if (!canFund || !anchorWallet || !vaultPda || !publicKey || !subcontractorPk) return;
    setBusy(true);
    setTxResult(null);
    try {
      const program = getProgram(connection, anchorWallet);
      const amountLamports = new BN(Math.round(parseFloat(form.amountSol) * LAMPORTS_PER_SOL));
      const practicalCompletionTs = new BN(
        Math.floor(new Date(form.practicalCompletionDate).getTime() / 1000)
      );

      const signature = await program.methods
        .fund_vault(
          session.projectId,
          amountLamports,
          practicalCompletionTs,
          parseInt(form.dlpDays, 10),
          parseInt(form.graceDays, 10),
          parseInt(form.releaseScheduleBps, 10),
          subcontractorPk,
          new PublicKey(session.certifier),
          new PublicKey(session.adjudicator),
          new PublicKey(session.demoAuthority)
        )
        .accounts({
          main_contractor: publicKey,
          rent_payer: publicKey, // demo: same wallet fronts rent; swap for Verita's rent_payer keypair in a real deployment
          vault: vaultPda,
          system_program: SystemProgram.programId,
        })
        .rpc();

      setTxResult({ ok: true, message: "Vault funded.", signature });
    } catch (err) {
      setTxResult({
        ok: false,
        message: err instanceof Error ? err.message : "Failed to fund vault.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <PageHeader
        icon={EngineeringIcon}
        title="Main Contractor"
        description="Fund the retention vault. Once funded, the program owns the PDA — no instruction exists that lets the contractor withdraw deposited retention. That refusal is structural, not a permission check that could be bypassed."
        accent={m3Tokens.primaryContainer}
        onAccent={m3Tokens.onPrimaryContainer}
      />

      <VaultSessionForm />

      <Paper
        variant="outlined"
        sx={{ p: 3, mb: 2.5, backgroundColor: m3Tokens.surfaceContainerLow }}
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
              backgroundColor: m3Tokens.primaryContainer,
              color: m3Tokens.onPrimaryContainer,
            }}
          >
            <SavingsIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1">Fund vault</Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Amount (SOL)"
              type="number"
              size="small"
              fullWidth
              value={form.amountSol}
              onChange={(e) => setForm({ ...form, amountSol: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Practical completion date"
              type="date"
              size="small"
              fullWidth
              value={form.practicalCompletionDate}
              onChange={(e) =>
                setForm({ ...form, practicalCompletionDate: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="DLP days"
              type="number"
              size="small"
              fullWidth
              value={form.dlpDays}
              onChange={(e) => setForm({ ...form, dlpDays: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Grace days"
              type="number"
              size="small"
              fullWidth
              value={form.graceDays}
              onChange={(e) => setForm({ ...form, graceDays: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Release schedule (bps)"
              type="number"
              size="small"
              fullWidth
              value={form.releaseScheduleBps}
              onChange={(e) =>
                setForm({ ...form, releaseScheduleBps: e.target.value })
              }
            />
          </Grid>
        </Grid>
        <Stack spacing={2} sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            size="large"
            disabled={!canFund || busy}
            onClick={handleFund}
            sx={{ alignSelf: "flex-start" }}
          >
            {busy ? "Funding…" : "Fund vault"}
          </Button>
          {!connected && (
            <Alert severity="info">Connect the contractor wallet first.</Alert>
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
        sx={{
          p: 3,
          mb: 2.5,
          backgroundColor: m3Tokens.errorContainer,
          borderColor: "transparent",
        }}
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
              backgroundColor: m3Tokens.onErrorContainer,
              color: m3Tokens.errorContainer,
            }}
          >
            <BlockIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle1" sx={{ color: m3Tokens.onErrorContainer }}>
            Try to withdraw retention
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{ color: m3Tokens.onErrorContainer, mb: 2, opacity: 0.85 }}
        >
          There is no withdrawal instruction for the main contractor anywhere
          in the program interface — the button below is disabled by
          construction, not by a runtime check. The refusal is structural.
        </Typography>
        <Button
          variant="outlined"
          disabled
          sx={{
            color: m3Tokens.onErrorContainer,
            borderColor: m3Tokens.onErrorContainer,
          }}
        >
          Withdraw retention (no such instruction exists)
        </Button>
      </Paper>

      <VaultStatusCard vaultPda={vaultPda} />
    </Container>
  );
}
