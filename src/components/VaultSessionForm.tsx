"use client";

/**
 * VaultSessionForm — lets the operator/contractor set the project identity
 * (project_id + party pubkeys) that all views derive the vault PDA from.
 * This keeps Contractor/Subcontractor/Demo Control pointed at the same PDA
 * during a rehearsal. See DEMO-PLAN risk #9 for the reseed-per-run rationale.
 *
 * The form is uncontrolled-ish: local draft state is seeded once per session
 * "epoch" (tracked by a key) rather than synced via a useEffect, so we don't
 * fight React's render model with cross-render setState calls.
 */
import { useState } from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  Alert,
} from "@mui/material";
import { useVaultSession, type VaultSessionState } from "@/hooks/useVaultSession";

function VaultSessionFormInner({
  initial,
  onSave,
  onReset,
}: {
  initial: VaultSessionState;
  onSave: (session: VaultSessionState) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState(initial);

  const handleChange =
    (field: keyof VaultSessionState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocal({ ...local, [field]: e.target.value });
    };

  return (
    <Stack spacing={2}>
      <TextField
        label="Project ID"
        value={local.projectId}
        onChange={handleChange("projectId")}
        size="small"
        fullWidth
      />
      <TextField
        label="Main Contractor pubkey"
        value={local.mainContractor}
        onChange={handleChange("mainContractor")}
        size="small"
        fullWidth
      />
      <TextField
        label="Subcontractor pubkey"
        value={local.subcontractor}
        onChange={handleChange("subcontractor")}
        size="small"
        fullWidth
      />
      <TextField
        label="Certifier pubkey"
        value={local.certifier}
        onChange={handleChange("certifier")}
        size="small"
        fullWidth
      />
      <TextField
        label="Adjudicator pubkey"
        value={local.adjudicator}
        onChange={handleChange("adjudicator")}
        size="small"
        fullWidth
      />
      <TextField
        label="Demo authority pubkey"
        value={local.demoAuthority}
        onChange={handleChange("demoAuthority")}
        size="small"
        fullWidth
      />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={() => onSave(local)}>
          Save
        </Button>
        <Button variant="outlined" color="warning" onClick={onReset}>
          Reset session (new project ID)
        </Button>
      </Stack>
    </Stack>
  );
}

export function VaultSessionForm() {
  const { session, setSession, resetSession, vaultPda, vaultPdaError } =
    useVaultSession();

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Project / Vault Identity
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        These values derive the vault PDA (§1 of the API contract). All roles
        must use the same project ID and party pubkeys to land on the same
        vault.
      </Typography>
      {/* Keying on the loaded session's identity re-seeds the draft form
          whenever the underlying session changes (e.g. loaded from storage
          on mount, or reset), without needing a sync effect. */}
      <VaultSessionFormInner
        key={`${session.projectId}:${session.mainContractor}:${session.subcontractor}`}
        initial={session}
        onSave={setSession}
        onReset={() => resetSession()}
      />
      {vaultPdaError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {vaultPdaError}
        </Alert>
      )}
      {vaultPda && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Vault PDA: {vaultPda.toBase58()}
        </Alert>
      )}
    </Paper>
  );
}
