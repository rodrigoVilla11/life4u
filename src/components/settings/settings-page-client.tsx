"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CURRENCIES } from "@/lib/constants";
import { TIMEZONES } from "@/lib/timezone";
import { COLOR_THEMES, applyColorTheme, applyCustomPrimary } from "@/lib/color-themes";
import { WALLPAPER_OPTIONS } from "@/lib/dashboard/themes";
import { saveDashboardConfig } from "@/actions/dashboard";
import { upsertExchangeRate, deleteExchangeRate } from "@/actions/goals";
import { ArrowRight } from "lucide-react";
import { updateUserSettings } from "@/actions/dashboard";
import { createCategory, deleteCategory } from "@/actions/finance";
import { toast } from "sonner";
import {
  Plus, Trash2, Settings, Palette, ListTodo, DollarSign,
  CheckSquare, Wallet, Building2, Target, BarChart3, Dumbbell, Repeat, BookOpen, CalendarDays,
  Loader2, Globe, LayoutGrid, Puzzle,
} from "lucide-react";
import { useTheme } from "next-themes";

interface SettingsPageClientProps {
  settings: {
    primaryCurrency: string;
    dateFormat: string;
    weekStartsOn: number;
    theme: string;
    locale: string;
    timezone: string;
    showDashboardTasks: boolean;
    showDashboardFinance: boolean;
    showDashboardGoals: boolean;
    moduleTasksEnabled: boolean;
    moduleFinancesEnabled: boolean;
    moduleAccountsEnabled: boolean;
    moduleGoalsEnabled: boolean;
    moduleReportsEnabled: boolean;
    moduleGymEnabled: boolean;
    moduleHabitsEnabled: boolean;
    moduleStudyEnabled: boolean;
    moduleCalendarEnabled: boolean;
    colorTheme: string;
    customPrimaryColor: string | null;
    dashboardWallpaper: string | null;
  } | null;
  incomeCategories: Array<{ id: string; name: string; icon: string | null; isDefault: boolean }>;
  expenseCategories: Array<{ id: string; name: string; icon: string | null; isDefault: boolean }>;
  exchangeRates: Array<{ id: string; fromCurrency: string; toCurrency: string; rate: number; date: string }>;
}

const MODULE_CONFIG = [
  { key: "moduleTasksEnabled", label: "Tareas", description: "Grupos, tareas jerárquicas y subtareas", icon: CheckSquare, color: "text-blue-600 dark:text-blue-400" },
  { key: "moduleFinancesEnabled", label: "Finanzas", description: "Ingresos, gastos, transferencias y recurrentes", icon: Wallet, color: "text-emerald-600 dark:text-emerald-400" },
  { key: "moduleAccountsEnabled", label: "Cuentas", description: "Cuentas bancarias, billeteras y bolsillos", icon: Building2, color: "text-cyan-600 dark:text-cyan-400" },
  { key: "moduleGoalsEnabled", label: "Metas de Ahorro", description: "Objetivos financieros con ahorro diario y tracking", icon: Target, color: "text-violet-600 dark:text-violet-400" },
  { key: "moduleReportsEnabled", label: "Reportes", description: "Gráficos, análisis y estadísticas", icon: BarChart3, color: "text-orange-600 dark:text-orange-400" },
  { key: "moduleGymEnabled", label: "Gimnasio", description: "Rutinas de entrenamiento, ejercicios y tracking", icon: Dumbbell, color: "text-rose-600 dark:text-rose-400" },
  { key: "moduleHabitsEnabled", label: "Hábitos", description: "Seguimiento de hábitos, rutinas diarias y consistencia", icon: Repeat, color: "text-indigo-600 dark:text-indigo-400" },
  { key: "moduleStudyEnabled", label: "Estudio", description: "Materias, sesiones, Pomodoro, exámenes y planificación", icon: BookOpen, color: "text-teal-600 dark:text-teal-400" },
  { key: "moduleCalendarEnabled", label: "Calendario", description: "Vista unificada de todos tus eventos, sesiones y vencimientos", icon: CalendarDays, color: "text-sky-600 dark:text-sky-400" },
] as const;

export function SettingsPageClient({ settings, incomeCategories, expenseCategories, exchangeRates }: SettingsPageClientProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedColorTheme, setSelectedColorTheme] = useState(settings?.colorTheme ?? "default");
  const [customColor, setCustomColor] = useState(settings?.customPrimaryColor ?? "");
  const [selectedWallpaper, setSelectedWallpaper] = useState(settings?.dashboardWallpaper ?? "none");

  // General
  const [currency, setCurrency] = useState(settings?.primaryCurrency ?? "USD");
  const [dateFormat, setDateFormat] = useState(settings?.dateFormat ?? "dd/MM/yyyy");
  const [weekStart, setWeekStart] = useState(String(settings?.weekStartsOn ?? 1));
  const [timezone, setTimezone] = useState(settings?.timezone ?? "America/Argentina/Buenos_Aires");

  // Dashboard widgets
  const [showTasks, setShowTasks] = useState(settings?.showDashboardTasks ?? true);
  const [showFinance, setShowFinance] = useState(settings?.showDashboardFinance ?? true);
  const [showGoals, setShowGoals] = useState(settings?.showDashboardGoals ?? true);

  // Module toggles
  const [modules, setModules] = useState({
    moduleTasksEnabled: settings?.moduleTasksEnabled ?? true,
    moduleFinancesEnabled: settings?.moduleFinancesEnabled ?? true,
    moduleAccountsEnabled: settings?.moduleAccountsEnabled ?? true,
    moduleGoalsEnabled: settings?.moduleGoalsEnabled ?? true,
    moduleReportsEnabled: settings?.moduleReportsEnabled ?? true,
    moduleGymEnabled: settings?.moduleGymEnabled ?? true,
    moduleHabitsEnabled: settings?.moduleHabitsEnabled ?? true,
    moduleStudyEnabled: settings?.moduleStudyEnabled ?? true,
    moduleCalendarEnabled: settings?.moduleCalendarEnabled ?? true,
  });

  // Categories
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"INCOME" | "EXPENSE">("EXPENSE");

  function toggleModule(key: string, value: boolean) {
    setModules((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserSettings({
        primaryCurrency: currency,
        dateFormat,
        weekStartsOn: parseInt(weekStart),
        timezone,
        showDashboardTasks: showTasks,
        showDashboardFinance: showFinance,
        showDashboardGoals: showGoals,
        ...modules,
      });
      toast.success("Configuración guardada. Recargá la página para ver los cambios en la navegación.");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim(), type: newCatType });
      setNewCatName("");
      toast.success("Categoría creada");
    } catch {
      toast.error("Error al crear categoría");
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCategory(id);
      toast.success("Categoría eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground text-[15px] mt-1">Personalizá tu experiencia en Life4U</p>
      </div>

      {/* ===== MODULES ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Módulos</CardTitle>
          </div>
          <CardDescription>Activá o desactivá secciones completas de la app. Los módulos desactivados desaparecen de la navegación y el dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {MODULE_CONFIG.map((mod) => {
            const Icon = mod.icon;
            const enabled = modules[mod.key];
            return (
              <div
                key={mod.key}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${enabled ? "bg-accent/30" : "opacity-60"}`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${enabled ? "bg-card" : "bg-muted"}`}>
                  <Icon className={`h-5 w-5 ${enabled ? mod.color : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{mod.label}</p>
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(v) => toggleModule(mod.key, v)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ===== GENERAL ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle>General</CardTitle>
          </div>
          <CardDescription>Moneda, formato de fecha y zona horaria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Moneda Principal</Label>
              <NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Formato de Fecha</Label>
              <NativeSelect value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                <option value="yyyy-MM-dd">AAAA-MM-DD</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Inicio de Semana</Label>
              <NativeSelect value={weekStart} onChange={(e) => setWeekStart(e.target.value)}>
                <option value="0">Domingo</option>
                <option value="1">Lunes</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Zona Horaria</Label>
              <NativeSelect value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </NativeSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== APPEARANCE ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Apariencia</CardTitle>
          </div>
          <CardDescription>Tema, paleta de colores y personalización</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Light / Dark / System */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Modo</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "light", label: "Claro", preview: "bg-white border" },
                { value: "dark", label: "Oscuro", preview: "bg-zinc-900 border" },
                { value: "system", label: "Sistema", preview: "bg-gradient-to-br from-white to-zinc-900 border" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTheme(t.value); updateUserSettings({ theme: t.value }); }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    currentTheme === t.value ? "border-primary bg-accent/30" : "border-transparent hover:bg-accent/20"
                  }`}
                >
                  <div className={`h-12 w-full rounded-lg ${t.preview}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Paleta de Colores</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_THEMES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => {
                    setSelectedColorTheme(ct.id);
                    setCustomColor("");
                    applyColorTheme(ct.id, currentTheme === "dark");
                    updateUserSettings({ colorTheme: ct.id, customPrimaryColor: "" });
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    selectedColorTheme === ct.id && !customColor ? "border-primary bg-accent/30" : "border-transparent hover:bg-accent/20"
                  }`}
                >
                  <div className="flex gap-1 w-full">
                    {ct.previewColors.map((color, i) => (
                      <div key={i} className="h-6 flex-1 rounded-md" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium">{ct.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Color Personalizado</p>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={customColor || "#2563eb"}
                onChange={(e) => {
                  const hex = e.target.value;
                  setCustomColor(hex);
                  setSelectedColorTheme("");
                  applyCustomPrimary(hex, currentTheme === "dark");
                  updateUserSettings({ customPrimaryColor: hex, colorTheme: "custom" });
                }}
                className="h-11 w-16 p-1 cursor-pointer rounded-xl"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Elegí tu color</p>
                <p className="text-xs text-muted-foreground">Se aplica como color principal en toda la app</p>
              </div>
              {customColor && (
                <Button variant="ghost" size="xs" onClick={() => {
                  setCustomColor("");
                  setSelectedColorTheme("default");
                  applyColorTheme("default", currentTheme === "dark");
                  updateUserSettings({ customPrimaryColor: "", colorTheme: "default" });
                }}>
                  Resetear
                </Button>
              )}
            </div>
          </div>

          {/* Dashboard Wallpaper */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Fondo de la App</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {WALLPAPER_OPTIONS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => {
                    setSelectedWallpaper(wp.id);
                    saveDashboardConfig({ wallpaper: wp.id });
                    toast.success("Fondo actualizado");
                  }}
                  className={`relative h-14 rounded-xl border-2 transition-all overflow-hidden ${wp.preview} ${
                    selectedWallpaper === wp.id ? "border-primary ring-1 ring-primary scale-105" : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white/80 drop-shadow-sm">
                    {wp.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom background color */}
            <div className="flex items-center gap-3 mt-3">
              <Input
                type="color"
                value={selectedWallpaper.startsWith("custom:") ? selectedWallpaper.slice(7) : "#1e1b4b"}
                onChange={(e) => {
                  const val = `custom:${e.target.value}`;
                  setSelectedWallpaper(val);
                  saveDashboardConfig({ wallpaper: val });
                }}
                className="h-11 w-16 p-1 cursor-pointer rounded-xl"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Color personalizado</p>
                <p className="text-xs text-muted-foreground">Elegí cualquier color como fondo. El texto se adapta automáticamente.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== CATEGORIES ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Categorías</CardTitle>
          </div>
          <CardDescription>Categorías de transacciones personalizadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-2">
            <Input
              placeholder="Nueva categoría..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
              className="flex-1"
            />
            <NativeSelect value={newCatType} onChange={(e) => setNewCatType(e.target.value as "INCOME" | "EXPENSE")} className="w-auto min-w-[120px]">
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </NativeSelect>
            <Button onClick={handleAddCategory} size="icon" className="shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Ingresos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {incomeCategories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="gap-1 py-1">
                    {cat.icon} {cat.name}
                    {!cat.isDefault && (
                      <button onClick={() => handleDeleteCategory(cat.id)} className="ml-0.5 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-red-600" /> Gastos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {expenseCategories.map((cat) => (
                  <Badge key={cat.id} variant="secondary" className="gap-1 py-1">
                    {cat.icon} {cat.name}
                    {!cat.isDefault && (
                      <button onClick={() => handleDeleteCategory(cat.id)} className="ml-0.5 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== EXCHANGE RATES ===== */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Tipos de Cambio</CardTitle>
          </div>
          <CardDescription>Configurá las tasas de conversión para calcular metas en distintas monedas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new rate */}
          <ExchangeRateForm defaultCurrency={currency} />

          {/* Existing rates */}
          {exchangeRates.length > 0 ? (
            <div className="space-y-2">
              {exchangeRates.map((rate) => (
                <div key={rate.id} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant="secondary" className="font-mono text-xs">{rate.fromCurrency}</Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Badge variant="secondary" className="font-mono text-xs">{rate.toCurrency}</Badge>
                    <span className="font-semibold text-sm tabular-nums ml-1">{rate.rate}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    1 {rate.fromCurrency} = {rate.rate} {rate.toCurrency}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                      try { await deleteExchangeRate(rate.id); toast.success("Tipo de cambio eliminado"); }
                      catch { toast.error("Error al eliminar"); }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hay tipos de cambio configurados</p>
          )}
        </CardContent>
      </Card>

      {/* ===== SAVE BUTTON ===== */}
      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </div>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange }: {
  label: string; description: string; checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ExchangeRateForm({ defaultCurrency }: { defaultCurrency: string }) {
  const [from, setFrom] = useState(defaultCurrency);
  const [to, setTo] = useState(defaultCurrency === "USD" ? "EUR" : "USD");
  const [rate, setRate] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!rate || Number(rate) <= 0 || from === to) {
      toast.error("Completá los campos correctamente");
      return;
    }
    setAdding(true);
    try {
      await upsertExchangeRate({ fromCurrency: from, toCurrency: to, rate: Number(rate) });
      setRate("");
      toast.success(`Tipo de cambio ${from} → ${to} guardado`);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">De</Label>
        <NativeSelect value={from} onChange={(e) => setFrom(e.target.value)} className="w-20 h-9 text-sm">
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
        </NativeSelect>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">A</Label>
        <NativeSelect value={to} onChange={(e) => setTo(e.target.value)} className="w-20 h-9 text-sm">
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
        </NativeSelect>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Tasa</Label>
        <Input
          type="number"
          step="0.0001"
          placeholder="0.92"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-28 h-9 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </div>
      <Button size="sm" onClick={handleAdd} disabled={adding || !rate} className="h-9 gap-1">
        <Plus className="h-3.5 w-3.5" />
        {adding ? "..." : "Agregar"}
      </Button>
    </div>
  );
}
