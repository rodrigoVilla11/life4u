"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Check } from "lucide-react";
import { ACCENT_THEMES, WALLPAPER_OPTIONS } from "@/lib/dashboard/themes";
import { saveDashboardConfig } from "@/actions/dashboard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ThemePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWallpaper: string;
  currentAccentColor: string;
  onWallpaperChange: (wallpaper: string) => void;
  onAccentColorChange: (color: string) => void;
}

export function ThemePicker({
  open,
  onOpenChange,
  currentWallpaper,
  currentAccentColor,
  onWallpaperChange,
  onAccentColorChange,
}: ThemePickerProps) {

  async function handleAccentChange(colorName: string) {
    onAccentColorChange(colorName);
    try {
      await saveDashboardConfig({ accentColor: colorName });
    } catch {
      toast.error("Error al guardar el color");
    }
  }

  async function handleWallpaperChange(wallpaperId: string) {
    onWallpaperChange(wallpaperId);
    try {
      await saveDashboardConfig({ wallpaper: wallpaperId });
    } catch {
      toast.error("Error al guardar el fondo");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[75vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Personalizar Tema</SheetTitle>
          <SheetDescription>
            Elegí el color de acento y fondo de tu dashboard
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
          {/* Accent Colors */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Color de acento</h3>
            <div className="flex flex-wrap gap-3">
              {ACCENT_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleAccentChange(theme.name)}
                  className={cn(
                    "relative h-10 w-10 rounded-full transition-all duration-200",
                    theme.primary,
                    currentAccentColor === theme.name
                      ? `ring-2 ring-offset-2 ring-offset-background ${theme.ring} scale-110`
                      : "hover:scale-105"
                  )}
                  title={theme.label}
                >
                  {currentAccentColor === theme.name && (
                    <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Wallpapers */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Fondo</h3>
            <div className="grid grid-cols-3 gap-3">
              {WALLPAPER_OPTIONS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => handleWallpaperChange(wp.id)}
                  className={cn(
                    "relative h-16 rounded-xl border-2 transition-all duration-200 overflow-hidden",
                    wp.preview,
                    currentWallpaper === wp.id
                      ? "border-primary ring-1 ring-primary scale-105"
                      : "border-transparent hover:border-muted-foreground/30 hover:scale-102"
                  )}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white/80 drop-shadow-sm">
                    {wp.label}
                  </span>
                  {currentWallpaper === wp.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
