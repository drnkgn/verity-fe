"use client";

/**
 * BackstopCountdown — renders time remaining to backstop_ts, refreshed on
 * account change (so an advance_clock call updates it live), per API-CONTRACT §5.
 */
import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import LockClockIcon from "@mui/icons-material/LockClock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { m3Tokens } from "@/theme/m3Theme";

function formatDuration(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "-" : "";
  const s = Math.abs(totalSeconds);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  parts.push(`${hours}h`, `${minutes}m`, `${seconds}s`);
  return `${sign}${parts.join(" ")}`;
}

export function BackstopCountdown({
  backstopTs,
  clockOffset,
}: {
  backstopTs: number;
  clockOffset: number;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const effectiveTs = now + clockOffset;
  const remaining = backstopTs - effectiveTs;
  const reached = remaining <= 0;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        px: 2,
        py: 1,
        borderRadius: "999px",
        backgroundColor: reached
          ? m3Tokens.successContainer
          : m3Tokens.surfaceContainerHigh,
        color: reached ? m3Tokens.onSuccessContainer : m3Tokens.onSurfaceVariant,
      }}
    >
      {reached ? (
        <LockOpenIcon fontSize="small" />
      ) : (
        <LockClockIcon fontSize="small" />
      )}
      <Stack spacing={0} sx={{ lineHeight: 1.1 }}>
        <Typography variant="caption" sx={{ opacity: 0.85, lineHeight: 1 }}>
          {reached ? "Backstop reached" : "Backstop in"}
        </Typography>
        {!reached && (
          <Typography
            variant="body2"
            fontWeight={700}
            fontFamily="monospace"
            sx={{ lineHeight: 1.2 }}
          >
            {formatDuration(remaining)}
          </Typography>
        )}
        {reached && (
          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            Claimable now
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
