"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Toolbar, Typography, Stack, Button } from "@mui/material";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { hasDemoClockInstruction } from "@/lib/program";

const NAV_LINKS = [
  { href: "/contractor", label: "Contractor" },
  { href: "/subcontractor", label: "Subcontractor" },
];

export function AppHeader() {
  const pathname = usePathname();
  const showDemoControl = hasDemoClockInstruction();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h6" component={Link} href="/" sx={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}>
          Verita
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
          {NAV_LINKS.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              variant={pathname === link.href ? "contained" : "text"}
              size="small"
            >
              {link.label}
            </Button>
          ))}
          {showDemoControl && (
            <Button
              component={Link}
              href="/demo-control"
              variant={pathname === "/demo-control" ? "contained" : "text"}
              color="secondary"
              size="small"
            >
              Demo Control
            </Button>
          )}
        </Stack>
        <WalletMultiButton />
      </Toolbar>
    </AppBar>
  );
}
