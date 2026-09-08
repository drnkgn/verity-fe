"use client";

/**
 * ExplorerLink — renders a Solana Explorer link for a tx signature or address,
 * per API-CONTRACT §5.
 */
import { Link as MuiLink } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/constants";
import { m3Tokens } from "@/theme/m3Theme";

export function TxExplorerLink({ signature }: { signature: string }) {
  return (
    <MuiLink
      href={explorerTxUrl(signature)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        fontFamily: "monospace",
        color: m3Tokens.primary,
        textDecorationColor: m3Tokens.primary,
      }}
    >
      {signature.slice(0, 8)}…{signature.slice(-8)}
      <OpenInNewIcon fontSize="inherit" />
    </MuiLink>
  );
}

export function AddressExplorerLink({
  address,
  label,
}: {
  address: string;
  label?: string;
}) {
  return (
    <MuiLink
      href={explorerAddressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        fontFamily: "monospace",
        color: m3Tokens.primary,
        textDecorationColor: m3Tokens.primary,
      }}
    >
      {label ?? `${address.slice(0, 6)}…${address.slice(-6)}`}
      <OpenInNewIcon fontSize="inherit" />
    </MuiLink>
  );
}
