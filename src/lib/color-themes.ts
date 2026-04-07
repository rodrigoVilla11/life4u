export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  // Preview colors for the selector
  previewColors: [string, string, string]; // [bg, primary, accent]
  // CSS variable overrides (light mode)
  light: Record<string, string>;
  // CSS variable overrides (dark mode)
  dark: Record<string, string>;
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "default",
    name: "Neutro",
    description: "Blanco y negro clásico",
    previewColors: ["#fafafa", "#171717", "#f5f5f5"],
    light: {},
    dark: {},
  },
  {
    id: "blue",
    name: "Azul Océano",
    description: "Tonos azules profesionales",
    previewColors: ["#f0f7ff", "#2563eb", "#dbeafe"],
    light: {
      "--primary": "oklch(0.546 0.245 262.881)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.932 0.032 255.585)",
      "--accent-foreground": "oklch(0.21 0.034 264.665)",
      "--ring": "oklch(0.546 0.245 262.881)",
      "--sidebar-primary": "oklch(0.546 0.245 262.881)",
    },
    dark: {
      "--primary": "oklch(0.623 0.214 259.815)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.25 0.04 260)",
      "--ring": "oklch(0.623 0.214 259.815)",
      "--sidebar-primary": "oklch(0.623 0.214 259.815)",
    },
  },
  {
    id: "violet",
    name: "Violeta Premium",
    description: "Elegante y moderno",
    previewColors: ["#f5f3ff", "#7c3aed", "#ede9fe"],
    light: {
      "--primary": "oklch(0.541 0.281 293.009)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.943 0.029 294.588)",
      "--accent-foreground": "oklch(0.25 0.06 293)",
      "--ring": "oklch(0.541 0.281 293.009)",
      "--sidebar-primary": "oklch(0.541 0.281 293.009)",
    },
    dark: {
      "--primary": "oklch(0.627 0.265 303.9)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.25 0.05 295)",
      "--ring": "oklch(0.627 0.265 303.9)",
      "--sidebar-primary": "oklch(0.627 0.265 303.9)",
    },
  },
  {
    id: "emerald",
    name: "Esmeralda",
    description: "Fresco y natural",
    previewColors: ["#ecfdf5", "#059669", "#d1fae5"],
    light: {
      "--primary": "oklch(0.596 0.145 163.225)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.95 0.025 163)",
      "--accent-foreground": "oklch(0.2 0.03 163)",
      "--ring": "oklch(0.596 0.145 163.225)",
      "--sidebar-primary": "oklch(0.596 0.145 163.225)",
    },
    dark: {
      "--primary": "oklch(0.696 0.17 162.48)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.22 0.04 163)",
      "--ring": "oklch(0.696 0.17 162.48)",
      "--sidebar-primary": "oklch(0.696 0.17 162.48)",
    },
  },
  {
    id: "rose",
    name: "Rosa",
    description: "Cálido y vibrante",
    previewColors: ["#fff1f2", "#e11d48", "#ffe4e6"],
    light: {
      "--primary": "oklch(0.551 0.226 15.341)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.95 0.025 12)",
      "--accent-foreground": "oklch(0.2 0.04 12)",
      "--ring": "oklch(0.551 0.226 15.341)",
      "--sidebar-primary": "oklch(0.551 0.226 15.341)",
    },
    dark: {
      "--primary": "oklch(0.645 0.246 16.439)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.22 0.04 12)",
      "--ring": "oklch(0.645 0.246 16.439)",
      "--sidebar-primary": "oklch(0.645 0.246 16.439)",
    },
  },
  {
    id: "amber",
    name: "Ámbar Cálido",
    description: "Energético y creativo",
    previewColors: ["#fffbeb", "#d97706", "#fef3c7"],
    light: {
      "--primary": "oklch(0.666 0.179 58.318)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.96 0.03 80)",
      "--accent-foreground": "oklch(0.2 0.04 60)",
      "--ring": "oklch(0.666 0.179 58.318)",
      "--sidebar-primary": "oklch(0.666 0.179 58.318)",
    },
    dark: {
      "--primary": "oklch(0.769 0.188 70.08)",
      "--primary-foreground": "oklch(0.12 0 0)",
      "--accent": "oklch(0.22 0.04 60)",
      "--ring": "oklch(0.769 0.188 70.08)",
      "--sidebar-primary": "oklch(0.769 0.188 70.08)",
    },
  },
  {
    id: "cyan",
    name: "Cyan Tech",
    description: "Futurista y limpio",
    previewColors: ["#ecfeff", "#0891b2", "#cffafe"],
    light: {
      "--primary": "oklch(0.598 0.134 196.813)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.95 0.02 200)",
      "--accent-foreground": "oklch(0.2 0.03 200)",
      "--ring": "oklch(0.598 0.134 196.813)",
      "--sidebar-primary": "oklch(0.598 0.134 196.813)",
    },
    dark: {
      "--primary": "oklch(0.715 0.143 199)",
      "--primary-foreground": "oklch(0.12 0 0)",
      "--accent": "oklch(0.22 0.03 200)",
      "--ring": "oklch(0.715 0.143 199)",
      "--sidebar-primary": "oklch(0.715 0.143 199)",
    },
  },
  {
    id: "orange",
    name: "Naranja Energía",
    description: "Dinámico y activo",
    previewColors: ["#fff7ed", "#ea580c", "#fed7aa"],
    light: {
      "--primary": "oklch(0.605 0.213 41.116)",
      "--primary-foreground": "oklch(0.985 0 0)",
      "--accent": "oklch(0.95 0.03 50)",
      "--accent-foreground": "oklch(0.2 0.04 40)",
      "--ring": "oklch(0.605 0.213 41.116)",
      "--sidebar-primary": "oklch(0.605 0.213 41.116)",
    },
    dark: {
      "--primary": "oklch(0.72 0.2 41)",
      "--primary-foreground": "oklch(0.12 0 0)",
      "--accent": "oklch(0.22 0.04 40)",
      "--ring": "oklch(0.72 0.2 41)",
      "--sidebar-primary": "oklch(0.72 0.2 41)",
    },
  },
];

/**
 * Apply a color theme by injecting CSS variables into :root
 */
export function applyColorTheme(themeId: string, isDark: boolean) {
  const theme = COLOR_THEMES.find((t) => t.id === themeId);
  if (!theme) return;

  const vars = isDark ? theme.dark : theme.light;
  const root = document.documentElement;

  // Reset custom properties first (remove previous theme)
  for (const t of COLOR_THEMES) {
    for (const key of Object.keys(t.light)) {
      root.style.removeProperty(key);
    }
    for (const key of Object.keys(t.dark)) {
      root.style.removeProperty(key);
    }
  }

  // Apply new theme
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Apply custom colors (user-defined primary)
 */
export function applyCustomPrimary(hex: string, isDark: boolean) {
  const root = document.documentElement;
  // Convert hex to approximate oklch - simplified
  // For proper conversion we'd need a color library, but this works for common colors
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--ring", hex);
  root.style.setProperty("--sidebar-primary", hex);
}
