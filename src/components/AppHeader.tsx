"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  ButtonBase,
  Box,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HandymanIcon from "@mui/icons-material/Handyman";
import TuneIcon from "@mui/icons-material/Tune";
import { hasDemoClockInstruction } from "@/lib/program";
import { m3Tokens } from "@/theme/m3Theme";
import { WalletButton } from "@/components/WalletButton";

const NAV_LINKS = [
  { href: "/contractor", label: "Contractor", icon: EngineeringIcon },
  { href: "/subcontractor", label: "Subcontractor", icon: HandymanIcon },
];

function NavSegment({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ fontSize: "small" }>;
  active: boolean;
}) {
  return (
    <ButtonBase
      component={Link}
      href={href}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 2,
        py: 0.75,
        borderRadius: 999,
        typography: "body2",
        fontWeight: 600,
        color: active ? m3Tokens.onSecondaryContainer : m3Tokens.onSurfaceVariant,
        backgroundColor: active ? m3Tokens.secondaryContainer : "transparent",
        transition: "background-color 120ms ease, color 120ms ease",
        "&:hover": {
          backgroundColor: active
            ? m3Tokens.secondaryContainer
            : m3Tokens.surfaceContainerHigh,
        },
      }}
    >
      <Icon fontSize="small" />
      {label}
    </ButtonBase>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const showDemoControl = hasDemoClockInstruction();

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: 1 }}>
        <ButtonBase
          component={Link}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 2,
            px: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "10px",
              backgroundColor: m3Tokens.primaryContainer,
              color: m3Tokens.onPrimaryContainer,
            }}
          >
            <LockIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ color: m3Tokens.onSurface }}>
            Verita
          </Typography>
        </ButtonBase>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            flexGrow: 1,
            backgroundColor: m3Tokens.surfaceContainer,
            borderRadius: 999,
            p: 0.5,
            width: "fit-content",
          }}
        >
          {NAV_LINKS.map((link) => (
            <NavSegment
              key={link.href}
              href={link.href}
              label={link.label}
              Icon={link.icon}
              active={pathname === link.href}
            />
          ))}
          {showDemoControl && (
            <NavSegment
              href="/demo-control"
              label="Demo Control"
              Icon={TuneIcon}
              active={pathname === "/demo-control"}
            />
          )}
        </Stack>

        <WalletButton />
      </Toolbar>
    </AppBar>
  );
}
