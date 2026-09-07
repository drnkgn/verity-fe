"use client";

/**
 * BackstopCountdown — renders time remaining to backstop_ts, refreshed on
 * account change (so an advance_clock call updates it live), per API-CONTRACT §5.
 */
import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import LockClockIcon from "@mui/icons-material/LockClock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

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
    <Chip
      icon={reached ? <LockOpenIcon /> : <LockClockIcon />}
      color={reached ? "success" : "default"}
      label={
        reached
          ? "Backstop reached — claimable"
          : `Backstop in ${formatDuration(remaining)}`
      }
      variant={reached ? "filled" : "outlined"}
    />
  );
}
