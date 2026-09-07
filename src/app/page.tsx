"use client";

import Link from "next/link";
import { Container, Typography, Stack, Card, CardContent, CardActions, Button } from "@mui/material";

const ROLES = [
  {
    href: "/contractor",
    title: "Main Contractor",
    description:
      "Fund a retention vault and see the program refuse any withdrawal attempt after funding.",
  },
  {
    href: "/subcontractor",
    title: "Subcontractor",
    description:
      "Watch the vault balance and backstop countdown live, then claim unilaterally once the DLP backstop is reached.",
  },
  {
    href: "/demo-control",
    title: "Demo Control (Operator)",
    description:
      "Fast-forward the effective clock on stage via the demo-only advance_clock instruction.",
  },
];

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Verita — Retention Vault
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Programmatic custody of construction retention funds on Solana
        devnet. Native SOL is held in a program-owned PDA — the main
        contractor cannot withdraw it under any circumstances; the
        subcontractor can claim unilaterally once the time backstop is
        reached.
      </Typography>
      <Stack spacing={2}>
        {ROLES.map((role) => (
          <Card key={role.href} variant="outlined">
            <CardContent>
              <Typography variant="h6">{role.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {role.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} href={role.href} size="small">
                Open
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
