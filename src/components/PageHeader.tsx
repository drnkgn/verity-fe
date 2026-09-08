"use client";

import { Box, Stack, Typography } from "@mui/material";
import { m3Tokens } from "@/theme/m3Theme";

export function PageHeader({
  icon: Icon,
  title,
  description,
  accent = m3Tokens.primaryContainer,
  onAccent = m3Tokens.onPrimaryContainer,
}: {
  icon: React.ComponentType<{ fontSize?: "small" | "medium" | "large" }>;
  title: string;
  description: string;
  accent?: string;
  onAccent?: string;
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 4 }}>
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: accent,
          color: onAccent,
          flexShrink: 0,
        }}
      >
        <Icon fontSize="medium" />
      </Box>
      <Stack spacing={0.5}>
        <Typography variant="h4">{title}</Typography>
        <Typography
          variant="body1"
          sx={{ color: m3Tokens.onSurfaceVariant, maxWidth: 620 }}
        >
          {description}
        </Typography>
      </Stack>
    </Stack>
  );
}
