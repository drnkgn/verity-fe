"use client";

/**
 * SolAmount — renders lamports as SOL with an illustrative MYR-equivalent label.
 * Per API-CONTRACT §0 and DEMO-PLAN risk #5: the MYR figure must be clearly
 * labeled illustrative/demo-only so it never reads as a real FX oracle.
 */
import { Stack, Typography, Tooltip } from "@mui/material";
import BN from "bn.js";
import { LAMPORTS_PER_SOL, MYR_PER_SOL } from "@/lib/constants";

function lamportsToSol(lamports: BN | number): number {
  const value = typeof lamports === "number" ? lamports : lamports.toNumber();
  return value / LAMPORTS_PER_SOL;
}

export function SolAmount({
  lamports,
  variant = "body1",
}: {
  lamports: BN | number;
  variant?: "h4" | "h5" | "h6" | "body1" | "body2";
}) {
  const sol = lamportsToSol(lamports);
  const myr = sol * MYR_PER_SOL;

  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography variant={variant} component="span" fontWeight={600}>
        {sol.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL
      </Typography>
      <Tooltip title="Illustrative rate, demo only — never stored or read on-chain.">
        <Typography variant="body2" component="span" color="text.secondary">
          (≈ RM {myr.toLocaleString(undefined, { maximumFractionDigits: 2 })}*)
        </Typography>
      </Tooltip>
    </Stack>
  );
}
