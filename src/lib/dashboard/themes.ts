export interface AccentTheme {
  name: string;
  label: string;
  primary: string;      // tailwind color class
  primaryHex: string;   // hex for CSS variable override
  ring: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  { name: "blue", label: "Azul", primary: "bg-blue-600", primaryHex: "#2563eb", ring: "ring-blue-500" },
  { name: "violet", label: "Violeta", primary: "bg-violet-600", primaryHex: "#7c3aed", ring: "ring-violet-500" },
  { name: "emerald", label: "Esmeralda", primary: "bg-emerald-600", primaryHex: "#059669", ring: "ring-emerald-500" },
  { name: "rose", label: "Rosa", primary: "bg-rose-600", primaryHex: "#e11d48", ring: "ring-rose-500" },
  { name: "orange", label: "Naranja", primary: "bg-orange-600", primaryHex: "#ea580c", ring: "ring-orange-500" },
  { name: "cyan", label: "Cyan", primary: "bg-cyan-600", primaryHex: "#0891b2", ring: "ring-cyan-500" },
  { name: "amber", label: "Ámbar", primary: "bg-amber-600", primaryHex: "#d97706", ring: "ring-amber-500" },
  { name: "indigo", label: "Índigo", primary: "bg-indigo-600", primaryHex: "#4f46e5", ring: "ring-indigo-500" },
];

export interface WallpaperOption {
  id: string;
  label: string;
  value: string; // CSS value
  preview: string; // preview class
  type: "solid" | "gradient" | "none";
}

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  { id: "none", label: "Sin fondo", value: "", preview: "bg-background", type: "none" },
  { id: "dark-blue", label: "Azul oscuro", value: "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900", preview: "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900", type: "gradient" },
  { id: "dark-violet", label: "Violeta oscuro", value: "bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900", preview: "bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900", type: "gradient" },
  { id: "dark-emerald", label: "Esmeralda", value: "bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900", preview: "bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900", type: "gradient" },
  { id: "sunset", label: "Atardecer", value: "bg-gradient-to-br from-orange-950 via-rose-950 to-violet-950", preview: "bg-gradient-to-br from-orange-950 via-rose-950 to-violet-950", type: "gradient" },
  { id: "midnight", label: "Medianoche", value: "bg-gradient-to-b from-gray-900 to-black", preview: "bg-gradient-to-b from-gray-900 to-black", type: "gradient" },
  { id: "ocean", label: "Océano", value: "bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950", preview: "bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950", type: "gradient" },
  { id: "aurora", label: "Aurora", value: "bg-gradient-to-br from-emerald-950 via-cyan-950 to-blue-950", preview: "bg-gradient-to-br from-emerald-950 via-cyan-950 to-blue-950", type: "gradient" },
  { id: "solid-dark", label: "Negro", value: "bg-zinc-950", preview: "bg-zinc-950", type: "solid" },
];

export function getAccentTheme(name: string): AccentTheme {
  return ACCENT_THEMES.find((t) => t.name === name) ?? ACCENT_THEMES[0];
}
