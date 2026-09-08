"use client";

/**
 * WalletButton — a minimal custom wallet connect/select button built directly
 * on useWallet()/useWalletModal(), replacing @solana/wallet-adapter-react-ui's
 * WalletMultiButton.
 *
 * WalletMultiButton reads wallet-adapter context during a transient render
 * pass that can happen before WalletProvider's internal adapter state is
 * populated (visible as `adapter={null}` in the provider tree), which throws
 * "tried to read X on a WalletContext without providing one" and forces a
 * full tree remount under React 19 + Next.js App Router. Driving the button
 * from useWallet() directly avoids that internal implementation detail, and
 * gating first paint on a mounted flag keeps SSR/CSR output identical (no
 * wallet state exists on the server, so nothing wallet-derived can mismatch).
 */
import { useSyncExternalStore } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { m3Tokens } from "@/theme/m3Theme";

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

// Client-only mount detection without an effect+setState pair: subscribe()
// never fires (no real store to change), so this purely distinguishes the
// SSR snapshot (false) from the client snapshot (true) on first paint.
function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function WalletButton() {
  const isClient = useIsClient();
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (!isClient) {
    // Static placeholder — identical on server and client until hydration
    // completes, so there is nothing here for React to diff/mismatch on.
    return (
      <Button
        variant="contained"
        startIcon={<AccountBalanceWalletIcon />}
        sx={{ backgroundColor: m3Tokens.primary, borderRadius: "999px" }}
      >
        Select Wallet
      </Button>
    );
  }

  if (connected && publicKey) {
    return (
      <Button
        variant="contained"
        startIcon={<AccountBalanceWalletIcon />}
        onClick={() => disconnect()}
        sx={{
          backgroundColor: m3Tokens.primaryContainer,
          color: m3Tokens.onPrimaryContainer,
          borderRadius: "999px",
          "&:hover": { backgroundColor: m3Tokens.outlineVariant },
        }}
      >
        {shortenAddress(publicKey.toBase58())}
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      startIcon={<AccountBalanceWalletIcon />}
      disabled={connecting}
      onClick={() => setVisible(true)}
      sx={{ backgroundColor: m3Tokens.primary, borderRadius: "999px" }}
    >
      {connecting ? "Connecting…" : "Select Wallet"}
    </Button>
  );
}
