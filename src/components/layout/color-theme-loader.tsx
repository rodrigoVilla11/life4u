"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { applyColorTheme, applyCustomPrimary } from "@/lib/color-themes";
import { WALLPAPER_OPTIONS } from "@/lib/dashboard/themes";
import { cn } from "@/lib/utils";

interface ColorThemeLoaderProps {
  colorTheme: string;
  customPrimaryColor: string | null;
  wallpaper: string | null;
}

// Determine if a hex color is "dark" (needs light text) or "light" (needs dark text)
function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Perceived luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

const DARK_BG_OVERRIDES: Record<string, string> = {
  "--foreground": "oklch(0.93 0 0)",
  "--card": "oklch(0.14 0 0 / 70%)",
  "--card-foreground": "oklch(0.93 0 0)",
  "--popover": "oklch(0.14 0 0 / 80%)",
  "--popover-foreground": "oklch(0.93 0 0)",
  "--muted": "oklch(0.2 0 0 / 60%)",
  "--muted-foreground": "oklch(0.65 0 0)",
  "--accent": "oklch(0.2 0 0 / 50%)",
  "--accent-foreground": "oklch(0.93 0 0)",
  "--secondary": "oklch(0.2 0 0 / 60%)",
  "--secondary-foreground": "oklch(0.93 0 0)",
  "--border": "oklch(1 0 0 / 10%)",
  "--input": "oklch(1 0 0 / 12%)",
  "--select-bg": "oklch(0.16 0 0)",
  "--select-option-fg": "oklch(0.93 0 0)",
  "--select-option-bg": "oklch(0.16 0 0)",
  "--sidebar": "oklch(0.1 0 0 / 70%)",
  "--sidebar-foreground": "oklch(0.93 0 0)",
  "--sidebar-accent": "oklch(0.2 0 0 / 50%)",
  "--sidebar-accent-foreground": "oklch(0.93 0 0)",
  "--sidebar-border": "oklch(1 0 0 / 10%)",
};

const LIGHT_BG_OVERRIDES: Record<string, string> = {
  "--foreground": "oklch(0.12 0 0)",
  "--card": "oklch(1 0 0 / 75%)",
  "--card-foreground": "oklch(0.12 0 0)",
  "--popover": "oklch(1 0 0 / 85%)",
  "--popover-foreground": "oklch(0.12 0 0)",
  "--muted": "oklch(0.96 0 0 / 60%)",
  "--muted-foreground": "oklch(0.4 0 0)",
  "--accent": "oklch(0.96 0 0 / 50%)",
  "--accent-foreground": "oklch(0.12 0 0)",
  "--secondary": "oklch(0.96 0 0 / 60%)",
  "--secondary-foreground": "oklch(0.12 0 0)",
  "--border": "oklch(0 0 0 / 10%)",
  "--input": "oklch(0 0 0 / 8%)",
  "--select-bg": "oklch(1 0 0)",
  "--select-option-fg": "oklch(0.12 0 0)",
  "--select-option-bg": "oklch(1 0 0)",
  "--sidebar": "oklch(1 0 0 / 70%)",
  "--sidebar-foreground": "oklch(0.12 0 0)",
  "--sidebar-accent": "oklch(0.96 0 0 / 50%)",
  "--sidebar-accent-foreground": "oklch(0.12 0 0)",
  "--sidebar-border": "oklch(0 0 0 / 8%)",
};

const ALL_OVERRIDE_KEYS = [...new Set([...Object.keys(DARK_BG_OVERRIDES), ...Object.keys(LIGHT_BG_OVERRIDES)])];

function parseWallpaper(wallpaper: string | null): { isActive: boolean; isCustom: boolean; customHex: string; presetId: string } {
  if (!wallpaper || wallpaper === "none") return { isActive: false, isCustom: false, customHex: "", presetId: "" };
  if (wallpaper.startsWith("custom:")) return { isActive: true, isCustom: true, customHex: wallpaper.slice(7), presetId: "" };
  return { isActive: true, isCustom: false, customHex: "", presetId: wallpaper };
}

export function ColorThemeLoader({ colorTheme, customPrimaryColor, wallpaper }: ColorThemeLoaderProps) {
  const { resolvedTheme } = useTheme();

  // Apply color theme
  useEffect(() => {
    if (customPrimaryColor) {
      applyCustomPrimary(customPrimaryColor, resolvedTheme === "dark");
    } else if (colorTheme && colorTheme !== "default" && colorTheme !== "custom") {
      applyColorTheme(colorTheme, resolvedTheme === "dark");
    }
  }, [colorTheme, customPrimaryColor, resolvedTheme]);

  // Apply text overrides based on wallpaper brightness
  const { isActive, isCustom, customHex, presetId } = parseWallpaper(wallpaper);

  useEffect(() => {
    const root = document.documentElement;

    if (!isActive) {
      for (const key of ALL_OVERRIDE_KEYS) root.style.removeProperty(key);
      return;
    }

    // Determine if bg is dark or light
    let needsDarkText = false;
    if (isCustom) {
      needsDarkText = !isColorDark(customHex); // light bg → dark text
    }
    // All preset wallpapers are dark backgrounds

    const overrides = needsDarkText ? LIGHT_BG_OVERRIDES : DARK_BG_OVERRIDES;
    for (const [key, value] of Object.entries(overrides)) {
      root.style.setProperty(key, value);
    }

    return () => {
      for (const key of ALL_OVERRIDE_KEYS) root.style.removeProperty(key);
    };
  }, [isActive, isCustom, customHex, presetId, resolvedTheme]);

  if (!isActive) return null;

  // Custom color wallpaper
  if (isCustom) {
    return (
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: customHex }} aria-hidden="true" />
    );
  }

  // Preset wallpaper
  const wp = WALLPAPER_OPTIONS.find((w) => w.id === presetId);
  if (!wp) return null;

  return (
    <div className={cn("fixed inset-0 -z-10", wp.value)} aria-hidden="true" />
  );
}
