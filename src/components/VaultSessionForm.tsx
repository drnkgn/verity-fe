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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  TextField,
  Typography,
  Button,
  Alert,
  Grid,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BadgeIcon from "@mui/icons-material/Badge";
import { useVaultSession, type VaultSessionState } from "@/hooks/useVaultSession";
import { m3Tokens } from "@/theme/m3Theme";

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

  const fields: { field: keyof VaultSessionState; label: string }[] = [
    { field: "projectId", label: "Project ID" },
    { field: "mainContractor", label: "Main Contractor pubkey" },
    { field: "subcontractor", label: "Subcontractor pubkey" },
    { field: "certifier", label: "Certifier pubkey" },
    { field: "adjudicator", label: "Adjudicator pubkey" },
    { field: "demoAuthority", label: "Demo authority pubkey" },
  ];

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        {fields.map(({ field, label }) => (
          <Grid item xs={12} sm={field === "projectId" ? 12 : 6} key={field}>
            <TextField
              label={label}
              value={local[field]}
              onChange={handleChange(field)}
              size="small"
              fullWidth
            />
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" onClick={() => onSave(local)}>
          Save
        </Button>
        <Button variant="outlined" color="error" onClick={onReset}>
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
    <Accordion
      defaultExpanded={!vaultPda}
      disableGutters
      sx={{
        mb: 3,
        borderRadius: "16px !important",
        border: `1px solid ${m3Tokens.outlineVariant}`,
        backgroundColor: m3Tokens.surfaceContainerLow,
        overflow: "hidden",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
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
            <BadgeIcon fontSize="small" />
          </Box>
          <Stack>
            <Typography variant="subtitle1">Project / Vault Identity</Typography>
            <Typography variant="caption" sx={{ color: m3Tokens.onSurfaceVariant }}>
              {vaultPda
                ? `Vault PDA: ${vaultPda.toBase58().slice(0, 10)}…${vaultPda.toBase58().slice(-6)}`
                : "Set identity to derive a vault PDA"}
            </Typography>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
        <Typography
          variant="body2"
          sx={{ color: m3Tokens.onSurfaceVariant, mb: 2.5 }}
        >
          These values derive the vault PDA (§1 of the API contract). All
          roles must use the same project ID and party pubkeys to land on
          the same vault.
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
      </AccordionDetails>
    </Accordion>
  );
}
