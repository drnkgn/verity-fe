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
  Divider,
} from "@mui/material";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { VaultSessionForm } from "@/components/VaultSessionForm";
import { VaultStatusCard } from "@/components/VaultStatusCard";
import { TxExplorerLink } from "@/components/ExplorerLink";
import { useVaultSession } from "@/hooks/useVaultSession";
import { getProgram } from "@/lib/program";
import { LAMPORTS_PER_SOL } from "@/lib/constants";

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Main Contractor
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fund the retention vault. Once funded, the program owns the PDA — no
        instruction exists that lets the contractor withdraw deposited
        retention. That refusal is structural, not a permission check that
        could be bypassed.
      </Typography>

      <VaultSessionForm />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Fund vault
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Amount (SOL)"
            type="number"
            size="small"
            value={form.amountSol}
            onChange={(e) => setForm({ ...form, amountSol: e.target.value })}
          />
          <TextField
            label="Practical completion date"
            type="date"
            size="small"
            value={form.practicalCompletionDate}
            onChange={(e) =>
              setForm({ ...form, practicalCompletionDate: e.target.value })
            }
          />
          <TextField
            label="DLP days"
            type="number"
            size="small"
            value={form.dlpDays}
            onChange={(e) => setForm({ ...form, dlpDays: e.target.value })}
          />
          <TextField
            label="Grace days"
            type="number"
            size="small"
            value={form.graceDays}
            onChange={(e) => setForm({ ...form, graceDays: e.target.value })}
          />
          <TextField
            label="Release schedule (bps, first moiety)"
            type="number"
            size="small"
            value={form.releaseScheduleBps}
            onChange={(e) =>
              setForm({ ...form, releaseScheduleBps: e.target.value })
            }
          />
          <Button
            variant="contained"
            disabled={!canFund || busy}
            onClick={handleFund}
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

      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderColor: "warning.main" }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Try to withdraw retention
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          There is no withdrawal instruction for the main contractor anywhere
          in the program interface — the button below is disabled by
          construction, not by a runtime check. The refusal is structural.
        </Typography>
        <Button variant="outlined" color="warning" disabled>
          Withdraw retention (no such instruction exists)
        </Button>
      </Paper>

      <Divider sx={{ mb: 2 }} />
      <VaultStatusCard vaultPda={vaultPda} />
    </Container>
  );
}
