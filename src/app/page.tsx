"use client";

import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";
import HandymanIcon from "@mui/icons-material/Handyman";
import TuneIcon from "@mui/icons-material/Tune";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldIcon from "@mui/icons-material/Shield";
import BoltIcon from "@mui/icons-material/Bolt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { m3Tokens } from "@/theme/m3Theme";

const ROLES = [
  {
    href: "/contractor",
    title: "Main Contractor",
    description:
      "Fund a retention vault and watch the program refuse any withdrawal attempt after funding — the refusal is structural, not a permission check.",
    icon: EngineeringIcon,
    container: m3Tokens.primaryContainer,
    onContainer: m3Tokens.onPrimaryContainer,
  },
  {
    href: "/subcontractor",
    title: "Subcontractor",
    description:
      "Watch the vault balance and backstop countdown live, then claim unilaterally once the DLP backstop is reached — no counterparty signature required.",
    icon: HandymanIcon,
    container: m3Tokens.tertiaryContainer,
    onContainer: m3Tokens.onTertiaryContainer,
  },
  {
    href: "/demo-control",
    title: "Demo Control",
    description:
      "Operator view. Fast-forward the effective clock on stage via the demo-only advance_clock instruction — absent entirely from production builds.",
    icon: TuneIcon,
    container: m3Tokens.secondaryContainer,
    onContainer: m3Tokens.onSecondaryContainer,
  },
];

const PILLARS = [
  {
    icon: ShieldIcon,
    title: "Non-custodial by construction",
    body: "Funds live in a program-owned PDA. There is no instruction that lets the contractor withdraw — the refusal is structural.",
  },
  {
    icon: BoltIcon,
    title: "Unilateral backstop release",
    body: "Once the DLP window plus grace period elapses, the subcontractor claims alone. No counterparty signature, ever.",
  },
  {
    icon: VisibilityIcon,
    title: "Verify it yourself",
    body: "Every balance is cross-checked live against the PDA's on-chain lamports, with an Explorer link one click away.",
  },
];

export default function Home() {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(160deg, ${m3Tokens.primaryContainer} 0%, ${m3Tokens.surface} 55%)`,
          borderBottom: `1px solid ${m3Tokens.outlineVariant}`,
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 11 } }}>
          <Chip
            label="Solana devnet · Retention vault demo"
            size="small"
            sx={{
              mb: 3,
              backgroundColor: m3Tokens.surfaceContainerHighest,
              color: m3Tokens.onSurfaceVariant,
            }}
          />
          <Typography
            variant="h2"
            sx={{ color: m3Tokens.onPrimaryContainer, mb: 2, maxWidth: 640 }}
          >
            Retention funds, held where no one can quietly take them back.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: m3Tokens.onSurfaceVariant, maxWidth: 560, mb: 4 }}
          >
            Verita (Tahan) isolates construction retention in a program-owned
            Solana PDA. The main contractor cannot withdraw it under any
            circumstances; the subcontractor can claim unilaterally once the
            time backstop is reached.
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href="/contractor"
              endIcon={<ArrowForwardIcon />}
            >
              Start as Contractor
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/subcontractor"
              sx={{ borderColor: m3Tokens.outline, color: m3Tokens.onSurface }}
            >
              Start as Subcontractor
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        {/* Trust pillars */}
        <Grid container spacing={3} sx={{ mb: 7 }}>
          {PILLARS.map((pillar) => (
            <Grid key={pillar.title} item xs={12} sm={4}>
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: m3Tokens.surfaceContainerHigh,
                    color: m3Tokens.primary,
                  }}
                >
                  <pillar.icon />
                </Box>
                <Typography variant="subtitle1">{pillar.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pillar.body}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Role cards */}
        <Typography variant="h5" sx={{ mb: 3 }}>
          Choose a role
        </Typography>
        <Grid container spacing={2.5}>
          {ROLES.map((role) => (
            <Grid key={role.href} item xs={12} sm={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: role.container,
                      color: role.onContainer,
                      mb: 2,
                    }}
                  >
                    <role.icon />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {role.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    component={Link}
                    href={role.href}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: m3Tokens.primary }}
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
