"use client";

/**
 * App-wide providers: Solana connection + wallet-adapter (Phantom, devnet) + MUI theme.
 * Per SPECIFICATIONS.md §4.2 and DEMO-PLAN FE-1.
 */
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { RPC_ENDPOINT } from "@/lib/constants";
import { VaultSessionProvider } from "@/hooks/useVaultSession";

import "@solana/wallet-adapter-react-ui/styles.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e3a5f" },
    secondary: { main: "#c9a227" },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <VaultSessionProvider>{children}</VaultSessionProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
