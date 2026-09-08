/**
 * Material 3 inspired MUI theme.
 *
 * MUI's theming API doesn't natively emit M3 tonal palettes, so this module
 * hand-derives the M3 "roles" (primary/secondary/tertiary + their container
 * and on-* pairs, surface variants, outline) from three seed hues and maps
 * them onto MUI's palette slots, then layers M3's shape scale, type scale,
 * and component-level shape/elevation conventions on top via `components`
 * overrides.
 *
 * Seed hues:
 *   - Primary: royal indigo-blue (custody, trust, "vault").
 *   - Secondary: slate violet (operator/demo-control accent).
 *   - Tertiary: warm amber/brass (the retention value being protected).
 * Surfaces carry a consistent lavender tint rather than near-white, so cards
 * separate visually from the page without relying only on borders.
 */
import { createTheme, alpha } from "@mui/material/styles";

// --- M3 tonal roles, hand-picked to sit at M3's conventional tonal stops
// (40/90/10 light-scheme pairs: base / container / on-container) --------
const m3 = {
  primary: "#3B4FE0",
  onPrimary: "#FFFFFF",
  primaryContainer: "#DCE0FF",
  onPrimaryContainer: "#101A5C",

  secondary: "#6750A4",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#E9DDFF",
  onSecondaryContainer: "#22005D",

  tertiary: "#A6650A",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFDDA1",
  onTertiaryContainer: "#341F00",

  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002",

  success: "#0E8345",
  onSuccess: "#FFFFFF",
  successContainer: "#A7F3B8",
  onSuccessContainer: "#00210D",

  surface: "#F5F2FF",
  surfaceDim: "#D6D1E8",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#EEEAFB",
  surfaceContainer: "#E3DFF7",
  surfaceContainerHigh: "#D9D3F0",
  surfaceContainerHighest: "#CFC8E9",
  onSurface: "#1B1B21",
  onSurfaceVariant: "#45464F",
  outline: "#767680",
  outlineVariant: "#C6C6D0",

  // Hero-only gradient stops (not a standard M3 role, used for the home
  // page hero band and reused wherever a "money-shot" banner is wanted).
  heroGradient: "linear-gradient(135deg, #3B4FE0 0%, #6750A4 45%, #A6650A 100%)",
} as const;

// M3 shape scale: extra-small 4, small 8, medium 12, large 16, extra-large 28.
const shape = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
};

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: m3.primary,
      contrastText: m3.onPrimary,
      light: m3.primaryContainer,
      dark: m3.onPrimaryContainer,
    },
    secondary: {
      main: m3.secondary,
      contrastText: m3.onSecondary,
      light: m3.secondaryContainer,
      dark: m3.onSecondaryContainer,
    },
    error: {
      main: m3.error,
      contrastText: m3.onError,
      light: m3.errorContainer,
      dark: m3.onErrorContainer,
    },
    warning: {
      main: m3.tertiary,
      contrastText: m3.onTertiary,
      light: m3.tertiaryContainer,
      dark: m3.onTertiaryContainer,
    },
    success: {
      main: m3.success,
      contrastText: m3.onSuccess,
      light: m3.successContainer,
      dark: m3.onSuccessContainer,
    },
    info: {
      main: m3.secondary,
      contrastText: m3.onSecondary,
      light: m3.secondaryContainer,
      dark: m3.onSecondaryContainer,
    },
    background: {
      default: m3.surface,
      paper: m3.surfaceContainerLow,
    },
    text: {
      primary: m3.onSurface,
      secondary: m3.onSurfaceVariant,
    },
    divider: m3.outlineVariant,
  },
  shape: {
    borderRadius: shape.md,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Roboto, system-ui, sans-serif",
    h1: { fontSize: "3.5rem", fontWeight: 400, letterSpacing: "-0.015em" },
    h2: { fontSize: "2.75rem", fontWeight: 400 },
    h3: { fontSize: "2.25rem", fontWeight: 500 },
    h4: { fontSize: "1.85rem", fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontSize: "1.5rem", fontWeight: 600 },
    h6: { fontSize: "1.15rem", fontWeight: 700 },
    subtitle1: { fontSize: "1rem", fontWeight: 600 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.875rem", lineHeight: 1.45 },
    button: { fontWeight: 600, textTransform: "none" as const },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: m3.surface,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: m3.surfaceContainerLow,
          backgroundImage: "none",
          color: m3.onSurface,
          boxShadow: "none",
          borderBottom: `1px solid ${m3.outlineVariant}`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: shape.xl,
          paddingInline: 20,
          paddingBlock: 8,
        },
        containedPrimary: {
          backgroundColor: m3.primary,
          color: m3.onPrimary,
          "&:hover": {
            backgroundColor: alpha(m3.primary, 0.9),
          },
        },
        outlined: {
          borderColor: m3.outline,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: shape.sm,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: shape.lg,
        },
        outlined: {
          borderColor: m3.outlineVariant,
          backgroundColor: m3.surfaceContainerLow,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: shape.lg,
          boxShadow: "none",
          border: `1px solid ${m3.outlineVariant}`,
          backgroundColor: m3.surfaceContainerLow,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: shape.sm,
          backgroundColor: m3.surfaceContainerLowest,
        },
        notchedOutline: {
          borderColor: m3.outline,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: shape.md,
        },
        standardInfo: {
          backgroundColor: m3.secondaryContainer,
          color: m3.onSecondaryContainer,
        },
        standardSuccess: {
          backgroundColor: m3.successContainer,
          color: m3.onSuccessContainer,
        },
        standardWarning: {
          backgroundColor: m3.tertiaryContainer,
          color: m3.onTertiaryContainer,
        },
        standardError: {
          backgroundColor: m3.errorContainer,
          color: m3.onErrorContainer,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: m3.outlineVariant,
        },
      },
    },
  },
});

/** M3 tonal role tokens, exported for components that need direct access
 * beyond what the MUI palette slots expose (e.g. tertiary container). */
export const m3Tokens = m3;
export const m3Shape = shape;
