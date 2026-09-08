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
import { m3Tokens as hc } from "@/theme/m3Theme";

const ROLES = [
  {
    href: "/contractor",
    title: "Main Contractor",
    description:
      "Fund a retention vault and watch the program refuse any withdrawal attempt after funding — the refusal is structural, not a permission check.",
    icon: EngineeringIcon,
    container: hc.primaryContainer,
    onContainer: hc.onPrimaryContainer,
  },
  {
    href: "/subcontractor",
    title: "Subcontractor",
    description:
      "Watch the vault balance and backstop countdown live, then claim unilaterally once the DLP backstop is reached — no counterparty signature required.",
    icon: HandymanIcon,
    container: hc.tertiaryContainer,
    onContainer: hc.onTertiaryContainer,
  },
  {
    href: "/demo-control",
    title: "Demo Control",
    description:
      "Operator view. Fast-forward the effective clock on stage via the demo-only advance_clock instruction — absent entirely from production builds.",
    icon: TuneIcon,
    container: hc.secondaryContainer,
    onContainer: hc.onSecondaryContainer,
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
    <Box sx={{ backgroundColor: hc.surface }}>
      {/* Hero */}
      <Box
        sx={{
          background: hc.heroGradient,
        }}
      >
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 11 } }}>
          <Chip
            label="Solana devnet · Retention vault demo"
            size="small"
            sx={{
              mb: 3,
              backgroundColor: "rgba(255,255,255,0.18)",
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          />
          <Typography variant="h2" sx={{ color: "#FFFFFF", mb: 2, maxWidth: 640 }}>
            Retention funds, held where no one can quietly take them back.
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255,255,255,0.88)", maxWidth: 560, mb: 4 }}
          >
            Verita (Tahan) isolates construction retention in a program-owned
            Solana PDA. The main contractor cannot withdraw it under any
            circumstances; the subcontractor can claim unilaterally once the
            time backstop is reached.
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              size="large"
              component={Link}
              href="/contractor"
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: "#FFFFFF",
                color: hc.primary,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
              }}
            >
              Start as Contractor
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              href="/subcontractor"
              sx={{
                borderColor: "rgba(255,255,255,0.6)",
                color: "#FFFFFF",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
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
                    backgroundColor: hc.surfaceContainerHigh,
                    color: hc.primary,
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
                  backgroundColor: hc.surfaceContainerLow,
                  borderColor: hc.outlineVariant,
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
                    sx={{ color: hc.primary }}
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
