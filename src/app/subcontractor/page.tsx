"use client";

/**
 * Subcontractor view — FE-2.
 *   - Live balance + backstop countdown (via VaultStatusCard / useVault subscription).
 *   - claim_release: sub-only, backstop-gated, no counterparty signature.
 * Per API-CONTRACT §3 claim_release.
 */
import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { VaultSessionForm } from "@/components/VaultSessionForm";
import { VaultStatusCard } from "@/components/VaultStatusCard";
import { TxExplorerLink } from "@/components/ExplorerLink";
import { useVaultSession } from "@/hooks/useVaultSession";
import { useVault } from "@/hooks/useVault";
import { getProgram } from "@/lib/program";
import { computeDerivedFields } from "@/lib/vault";

export default function SubcontractorPage() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { vaultPda } = useVaultSession();
  const { vault, refetch } = useVault(vaultPda);

  const [busy, setBusy] = useState(false);
  const [txResult, setTxResult] = useState<{ ok: boolean; message: string; signature?: string } | null>(null);

  const derived = vault ? computeDerivedFields(vault) : null;
  const canClaim =
    connected &&
    anchorWallet &&
    vaultPda &&
    vault &&
    derived?.isClaimable &&
    publicKey?.equals(vault.subcontractor);

  const handleClaim = async () => {
    if (!canClaim || !anchorWallet || !vaultPda || !publicKey || !vault) return;
    setBusy(true);
    setTxResult(null);
    try {
      const program = getProgram(connection, anchorWallet);
      const signature = await program.methods
        .claim_release()
        .accounts({
          subcontractor: publicKey,
          vault: vaultPda,
          rent_payer: vault.rent_payer,
        })
        .rpc();

      setTxResult({ ok: true, message: "Claim released.", signature });
      refetch();
    } catch (err) {
      setTxResult({
        ok: false,
        message: err instanceof Error ? err.message : "Claim failed.",
      });
    } finally {
      setBusy(false);
    }
  };

  const wrongWallet =
    connected && publicKey && vault && !publicKey.equals(vault.subcontractor);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Subcontractor
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Watch the vault balance and backstop countdown live. Once the DLP
        backstop is reached, claim unilaterally — no contractor or
        certifier signature is required.
      </Typography>

      <VaultSessionForm />

      <VaultStatusCard vaultPda={vaultPda} />

      <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Claim release
        </Typography>
        <Stack spacing={2}>
          {!connected && (
            <Alert severity="info">Connect the subcontractor wallet first.</Alert>
          )}
          {wrongWallet && (
            <Alert severity="warning">
              Connected wallet is not the subcontractor named on this vault.
              Switch wallets to claim.
            </Alert>
          )}
          {vault && derived && !derived.isClaimable && (
            <Alert severity="info">
              Not yet claimable — waiting for the DLP backstop to pass.
            </Alert>
          )}
          <Button
            variant="contained"
            color="success"
            disabled={!canClaim || busy}
            onClick={handleClaim}
          >
            {busy ? "Claiming…" : "Claim release"}
          </Button>
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
      <Divider sx={{ mt: 3 }} />
    </Container>
  );
}
