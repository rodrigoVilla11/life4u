"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  Target, Repeat, PiggyBank, Plus, Wallet, ListTodo,
  Settings2, GripVertical, Flame, BookOpen, Dumbbell,
  Timer, GraduationCap, CalendarClock, ChevronUp, ChevronDown,
  X, Palette, Save, Maximize2, Minimize2, Square, Play,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/constants";
import { DIAGNOSIS_CONFIG } from "@/lib/savings/status";
import { saveDashboardConfig } from "@/actions/dashboard";
import { WALLPAPER_OPTIONS } from "@/lib/dashboard/themes";
import {
  DEFAULT_WIDGET_CONFIG,
  WIDGET_REGISTRY,
  getWidgetDefinition,
  type WidgetConfig,
  type WidgetSize,
  type WidgetDefinition,
} from "@/lib/dashboard/widget-registry";
import { WidgetPicker } from "./widget-picker";
import { ThemePicker } from "./theme-picker";
import type { DashboardData, MonthlyReport, GoalDashboard } from "@/types";

// ==========================================
// TYPES
// ==========================================

interface HabitStats {
  totalHabits: number;
  todayCompleted: number;
  todayTotal: number;
  weekCompleted: number;
  bestStreak: number;
  todayProgress: number;
}

interface StudyStats {
  totalSessions: number;
  weekSessions: number;
  weekHours: number;
  weekPomodoros: number;
  totalSubjects: number;
  upcomingExams: Array<{
    id: string;
    title: string;
    date: string;
    subjectName: string;
    subjectColor: string | null;
    daysLeft: number;
  }>;
}

interface GymStats {
  total: number;
  thisWeek: number;
  streak: number;
}

interface DashboardConfig {
  widgetConfig: WidgetConfig[] | null;
  wallpaper: string | null;
  accentColor: string;
}

interface DashboardClientProps {
  data: DashboardData;
  monthlyReport: MonthlyReport[];
  userName: string;
  habitStats: HabitStats;
  studyStats: StudyStats;
  gymStats: GymStats;
  dashboardConfig: DashboardConfig;
}

// ==========================================
// HELPERS
// ==========================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Buenas noches";
  if (hour < 12) return "Buenos dias";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Math.abs(amount).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getWallpaperClasses(wallpaperId: string | null): string {
  if (!wallpaperId || wallpaperId === "none") return "";
  const wp = WALLPAPER_OPTIONS.find((w) => w.id === wallpaperId);
  return wp?.value ?? "";
}

function hasActiveWallpaper(wallpaperId: string | null): boolean {
  return !!wallpaperId && wallpaperId !== "none";
}

const SIZE_ORDER: WidgetSize[] = ["small", "medium", "large"];

function nextSize(current: WidgetSize, allowed: WidgetSize[]): WidgetSize {
  const currentIdx = SIZE_ORDER.indexOf(current);
  for (let i = 1; i <= SIZE_ORDER.length; i++) {
    const next = SIZE_ORDER[(currentIdx + i) % SIZE_ORDER.length];
    if (allowed.includes(next)) return next;
  }
  return current;
}

// ==========================================
// DASHBOARD CLIENT
// ==========================================

export function DashboardClient({
  data,
  monthlyReport,
  userName,
  habitStats,
  studyStats,
  gymStats,
  dashboardConfig,
}: DashboardClientProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    dashboardConfig.widgetConfig ?? DEFAULT_WIDGET_CONFIG
  );
  const [wallpaper, setWallpaper] = useState(dashboardConfig.wallpaper ?? "none");
  const [accentColor, setAccentColor] = useState(dashboardConfig.accentColor ?? "blue");
  const [editMode, setEditMode] = useState(false);
  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const glassEffect = hasActiveWallpaper(wallpaper);
  const cardClass = glassEffect ? "bg-card/80 backdrop-blur-sm border-white/10" : "";

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setWidgets((prev) => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const oldIndex = sorted.findIndex((w) => w.id === active.id);
      const newIndex = sorted.findIndex((w) => w.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const moved = arrayMove(sorted, oldIndex, newIndex);
      return moved.map((w, i) => ({ ...w, position: i }));
    });
  }

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => w.visible).sort((a, b) => a.position - b.position),
    [widgets]
  );

  // Widget operations
  const moveWidget = useCallback((id: string, direction: "up" | "down") => {
    setWidgets((prev) => {
      const sorted = [...prev].sort((a, b) => a.position - b.position);
      const idx = sorted.findIndex((w) => w.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const tempPos = sorted[idx].position;
      sorted[idx] = { ...sorted[idx], position: sorted[swapIdx].position };
      sorted[swapIdx] = { ...sorted[swapIdx], position: tempPos };
      return sorted;
    });
  }, []);

  const toggleWidgetSize = useCallback((id: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const def = getWidgetDefinition(w.type);
        if (!def) return w;
        return { ...w, size: nextSize(w.size, def.allowedSizes) };
      })
    );
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, visible: false } : w)));
  }, []);

  const addWidget = useCallback((definition: WidgetDefinition) => {
    setWidgets((prev) => {
      const existing = prev.find((w) => w.type === definition.type);
      if (existing) {
        return prev.map((w) =>
          w.type === definition.type ? { ...w, visible: true } : w
        );
      }
      const maxPos = Math.max(...prev.map((w) => w.position), -1);
      return [
        ...prev,
        {
          id: `w${Date.now()}`,
          type: definition.type,
          visible: true,
          size: definition.defaultSize,
          position: maxPos + 1,
        },
      ];
    });
  }, []);

  const saveConfig = useCallback(() => {
    startTransition(async () => {
      try {
        await saveDashboardConfig({
          widgetConfig: JSON.stringify(widgets),
          wallpaper,
          accentColor,
        });
        setEditMode(false);
        toast.success("Dashboard guardado");
      } catch {
        toast.error("Error al guardar");
      }
    });
  }, [widgets, wallpaper, accentColor]);

  // sizeToColSpan moved to SortableWidget component

  // ==========================================
  // WIDGET RENDERERS
  // ==========================================

  function renderWidget(config: WidgetConfig) {
    switch (config.type) {
      case "quick_actions":
        return <QuickActionsWidget />;
      case "stats":
        return <StatsWidget data={data} />;
      case "habits_today":
        return <HabitsTodayWidget stats={habitStats} size={config.size} />;
      case "finance_summary":
        return <FinanceSummaryWidget data={data} size={config.size} />;
      case "finance_chart":
        return <FinanceChartWidget monthlyReport={monthlyReport} />;
      case "study_focus":
        return <StudyFocusWidget stats={studyStats} size={config.size} />;
      case "goals_progress":
        return <GoalsProgressWidget data={data} size={config.size} />;
      case "gym_stats":
        return <GymStatsWidget stats={gymStats} size={config.size} />;
      case "recent_transactions":
        return <RecentTransactionsWidget data={data} />;
      case "upcoming_recurring":
        return <UpcomingRecurringWidget data={data} size={config.size} />;
      case "calendar_mini":
        return <CalendarMiniWidget />;
      case "tasks_summary":
        return <TasksSummaryWidget data={data} size={config.size} />;
      case "tasks_today":
        return <TasksTodayWidget data={data} />;
      case "tasks_overdue":
        return <TasksOverdueWidget data={data} size={config.size} />;
      case "habits_streak":
        return <HabitsStreakWidget stats={habitStats} size={config.size} />;
      case "habits_checklist":
        return <HabitsChecklistWidget stats={habitStats} />;
      case "study_exams":
        return <StudyExamsWidget stats={studyStats} size={config.size} />;
      case "study_quick":
        return <StudyQuickWidget stats={studyStats} size={config.size} />;
      case "goals_overview":
        return <GoalsOverviewWidget data={data} size={config.size} />;
      case "goals_required":
        return <GoalsRequiredWidget data={data} />;
      case "gym_week":
        return <GymWeekWidget stats={gymStats} size={config.size} />;
      case "gym_next":
        return <GymNextWidget stats={gymStats} size={config.size} />;
      default:
        return <div className="p-4 text-sm text-muted-foreground">Widget no encontrado</div>;
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="relative">
      {/* Wallpaper now rendered globally by ColorThemeLoader in layout */}

      <div className="mx-auto max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}{userName ? `, ${userName.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <Button
            variant={editMode ? "default" : "ghost"}
            size="icon"
            onClick={() => {
              if (editMode) {
                saveConfig();
              } else {
                setEditMode(true);
              }
            }}
            className={cn(
              "rounded-full h-10 w-10 transition-all",
              editMode && "shadow-lg"
            )}
          >
            {editMode ? (
              <Save className="h-4.5 w-4.5" />
            ) : (
              <Settings2 className="h-4.5 w-4.5" />
            )}
          </Button>
        </div>

        {/* Edit mode toolbar */}
        {editMode && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-2xl border",
            glassEffect ? "bg-card/80 backdrop-blur-sm border-white/10" : "bg-muted/50"
          )}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWidgetPickerOpen(true)}
              className="gap-1.5 rounded-xl"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar Widget
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setWidgets(dashboardConfig.widgetConfig ?? DEFAULT_WIDGET_CONFIG);
                setWallpaper(dashboardConfig.wallpaper ?? "none");
                setAccentColor(dashboardConfig.accentColor ?? "blue");
                setEditMode(false);
              }}
              className="text-muted-foreground text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={saveConfig}
              disabled={isPending}
              className="gap-1.5 rounded-xl"
            >
              <Save className="h-3.5 w-3.5" />
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        )}

        {/* Widget Grid with Drag & Drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={editMode ? handleDragEnd : undefined}>
          <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleWidgets.map((widget) => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  editMode={editMode}
                  cardClass={cardClass}
                  onToggleSize={() => toggleWidgetSize(widget.id)}
                  onRemove={() => removeWidget(widget.id)}
                >
                  {renderWidget(widget)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pickers */}
      <WidgetPicker
        open={widgetPickerOpen}
        onOpenChange={setWidgetPickerOpen}
        currentWidgets={widgets.filter((w) => w.visible)}
        onAddWidget={addWidget}
      />
      {/* Theme picker moved to Settings > Apariencia */}
    </div>
  );
}

// ==========================================
// WIDGET COMPONENTS
// ==========================================

function QuickActionsWidget() {
  return (
    <div className="p-4 flex flex-wrap gap-2">
      <Link href="/tasks?new=true" className="flex-1 min-w-30">
        <Button variant="outline" className="w-full gap-2 rounded-xl h-11">
          <Plus className="h-4 w-4 text-blue-500" />
          <span className="text-sm">Nueva tarea</span>
        </Button>
      </Link>
      <Link href="/finances?new=expense" className="flex-1 min-w-30">
        <Button variant="outline" className="w-full gap-2 rounded-xl h-11">
          <Wallet className="h-4 w-4 text-red-500" />
          <span className="text-sm">Nuevo gasto</span>
        </Button>
      </Link>
      <Link href="/goals?new=true" className="flex-1 min-w-30">
        <Button variant="outline" className="w-full gap-2 rounded-xl h-11">
          <Target className="h-4 w-4 text-emerald-500" />
          <span className="text-sm">Nueva meta</span>
        </Button>
      </Link>
    </div>
  );
}

function StatsWidget({ data }: { data: DashboardData }) {
  const stats = [
    {
      label: "Pendientes hoy",
      value: data.tasksSummary.todayPending,
      icon: <Clock className="h-4 w-4 text-blue-500" />,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Vencidas",
      value: data.tasksSummary.overdue,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      color: data.tasksSummary.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground",
    },
    {
      label: "Balance mes",
      value: formatCurrency(data.financeSummary.monthBalance),
      icon: data.financeSummary.monthBalance >= 0
        ? <TrendingUp className="h-4 w-4 text-emerald-500" />
        : <TrendingDown className="h-4 w-4 text-red-500" />,
      color: data.financeSummary.monthBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
    {
      label: "Ahorro total",
      value: formatCurrency(data.financeSummary.totalSavings),
      icon: <PiggyBank className="h-4 w-4 text-violet-500" />,
      color: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg bg-muted/50">{stat.icon}</div>
          <div>
            <p className={cn("text-lg font-bold leading-tight", stat.color)}>
              {stat.value}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HabitsTodayWidget({ stats, size }: { stats: HabitStats; size: WidgetSize }) {
  const progressPct = stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0;

  if (size === "small") {
    return (
      <div className="p-4 flex items-center gap-3">
        <Flame className="h-5 w-5 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold leading-tight">
            {stats.todayCompleted}/{stats.todayTotal}
          </p>
          <p className="text-[11px] text-muted-foreground">Habitos hoy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-semibold text-sm">Habitos de Hoy</span>
        </div>
        {stats.bestStreak > 0 && (
          <Badge variant="outline" className="gap-1 text-xs">
            <Flame className="h-3 w-3 text-orange-500" />
            {stats.bestStreak} dias
          </Badge>
        )}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">{stats.todayCompleted}</span>
        <span className="text-muted-foreground text-sm mb-1">/ {stats.todayTotal} habitos</span>
      </div>
      <Progress value={progressPct} className="h-2.5" />
      <p className="text-xs text-muted-foreground">
        {progressPct >= 100
          ? "Completaste todos los habitos de hoy"
          : `Te faltan ${stats.todayTotal - stats.todayCompleted} habitos`}
      </p>
    </div>
  );
}

function FinanceSummaryWidget({ data, size }: { data: DashboardData; size: WidgetSize }) {
  const { monthIncome, monthExpense, monthBalance } = data.financeSummary;

  if (size === "small") {
    return (
      <div className="p-4">
        <p className={cn(
          "text-lg font-bold",
          monthBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
        )}>
          {monthBalance >= 0 ? "+" : "-"}{formatCurrency(monthBalance)}
        </p>
        <p className="text-[11px] text-muted-foreground">Balance del mes</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-blue-500" />
        <span className="font-semibold text-sm">Resumen Financiero</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Ingresos</span>
          </div>
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(monthIncome)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
            <span className="text-sm text-muted-foreground">Gastos</span>
          </div>
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
            -{formatCurrency(monthExpense)}
          </span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Balance</span>
          <span className={cn(
            "text-base font-bold",
            monthBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}>
            {monthBalance >= 0 ? "+" : "-"}{formatCurrency(monthBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}

function FinanceChartWidget({ monthlyReport }: { monthlyReport: MonthlyReport[] }) {
  if (monthlyReport.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-48 text-sm text-muted-foreground">
        Sin datos suficientes para el grafico
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-500" />
        <span className="font-semibold text-sm">Ingresos vs Gastos</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyReport} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value) => [`$${Number(value).toLocaleString("es-AR")}`, ""]}
            />
            <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StudyFocusWidget({ stats, size }: { stats: StudyStats; size: WidgetSize }) {
  const nextExam = stats.upcomingExams?.[0];

  if (size === "small") {
    return (
      <div className="p-4 flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-indigo-500 shrink-0" />
        <div>
          <p className="text-lg font-bold leading-tight">{stats.weekHours.toFixed(1)}h</p>
          <p className="text-[11px] text-muted-foreground">Esta semana</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-indigo-500" />
        <span className="font-semibold text-sm">Estudio</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-2xl font-bold">{stats.weekHours.toFixed(1)}</p>
          <p className="text-[11px] text-muted-foreground">Horas esta semana</p>
        </div>
        <div>
          <p className="text-2xl font-bold flex items-center gap-1">
            {stats.weekPomodoros}
            <Timer className="h-4 w-4 text-red-500" />
          </p>
          <p className="text-[11px] text-muted-foreground">Pomodoros</p>
        </div>
      </div>
      {nextExam && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50">
          <GraduationCap className="h-4 w-4 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{nextExam.title}</p>
            <p className="text-[10px] text-muted-foreground">{nextExam.subjectName}</p>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {nextExam.daysLeft === 0
              ? "Hoy"
              : nextExam.daysLeft === 1
                ? "Manana"
                : `${nextExam.daysLeft}d`}
          </Badge>
        </div>
      )}
    </div>
  );
}

function GoalsProgressWidget({ data, size }: { data: DashboardData; size: WidgetSize }) {
  const goal = data.goalsSummary.closestGoal;

  if (!goal) {
    return (
      <div className="p-4 flex items-center gap-3 text-muted-foreground">
        <Target className="h-5 w-5" />
        <span className="text-sm">Sin metas activas</span>
      </div>
    );
  }

  const diagConfig = DIAGNOSIS_CONFIG[goal.status as keyof typeof DIAGNOSIS_CONFIG];
  const progressPct = Math.min(goal.progressVsMin, 100);

  if (size === "small") {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Target className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium truncate">{goal.name}</span>
        </div>
        <Progress value={progressPct} className="h-2" />
        <p className="text-[10px] text-muted-foreground mt-1">{progressPct.toFixed(0)}%</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-500" />
          <span className="font-semibold text-sm">Meta de Ahorro</span>
        </div>
        {diagConfig && (
          <span className="text-xs">{diagConfig.emoji}</span>
        )}
      </div>
      <div>
        <p className="font-medium text-sm">{goal.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(goal.realTotalToday, goal.currency)} / {formatCurrency(goal.targetMin, goal.currency)}
        </p>
      </div>
      <Progress value={progressPct} className="h-2.5" />
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{progressPct.toFixed(0)}% completado</span>
        {goal.requiredPerDayForMin > 0 && (
          <span>{formatCurrency(goal.requiredPerDayForMin, goal.currency)}/dia necesario</span>
        )}
      </div>
    </div>
  );
}

function GymStatsWidget({ stats, size }: { stats: GymStats; size: WidgetSize }) {
  if (size === "small") {
    return (
      <div className="p-4 flex items-center gap-3">
        <Dumbbell className="h-5 w-5 text-rose-500 shrink-0" />
        <div>
          <p className="text-lg font-bold leading-tight">{stats.thisWeek}</p>
          <p className="text-[11px] text-muted-foreground">Esta semana</p>
        </div>
        {stats.streak > 0 && (
          <Badge variant="outline" className="gap-1 text-xs ml-auto">
            <Flame className="h-3 w-3 text-orange-500" />
            {stats.streak}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-rose-500" />
        <span className="font-semibold text-sm">Gimnasio</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[11px] text-muted-foreground">Total</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
          <p className="text-[11px] text-muted-foreground">Semana</p>
        </div>
        <div>
          <p className="text-2xl font-bold flex items-center gap-1">
            {stats.streak}
            <Flame className="h-4 w-4 text-orange-500" />
          </p>
          <p className="text-[11px] text-muted-foreground">Racha</p>
        </div>
      </div>
    </div>
  );
}

function RecentTransactionsWidget({ data }: { data: DashboardData }) {
  if (data.recentTransactions.length === 0) {
    return (
      <div className="p-4 flex items-center gap-3 text-muted-foreground">
        <Wallet className="h-5 w-5" />
        <span className="text-sm">Sin movimientos recientes</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          <span className="font-semibold text-sm">Ultimos Movimientos</span>
        </div>
        <Link href="/finances" className="text-xs text-primary hover:underline">
          Ver todo
        </Link>
      </div>
      <div className="space-y-1.5">
        {data.recentTransactions.map((t) => (
          <div key={t.id} className="flex items-center gap-2.5 py-1.5">
            <div className="shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-base">
              {t.category?.icon ?? (t.type === "INCOME" ? "💰" : t.type === "EXPENSE" ? "💸" : "↔")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {t.description ?? t.category?.name ?? "Movimiento"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {format(new Date(t.date), "d MMM", { locale: es })}
              </p>
            </div>
            <span className={cn(
              "text-sm font-semibold shrink-0",
              t.type === "INCOME"
                ? "text-emerald-600 dark:text-emerald-400"
                : t.type === "EXPENSE"
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
            )}>
              {t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""}
              {formatCurrency(t.amount, t.currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingRecurringWidget({ data, size }: { data: DashboardData; size: WidgetSize }) {
  if (data.upcomingRecurring.length === 0) {
    return (
      <div className="p-4 flex items-center gap-3 text-muted-foreground">
        <Repeat className="h-5 w-5" />
        <span className="text-sm">Sin vencimientos proximos</span>
      </div>
    );
  }

  const items = size === "small" ? data.upcomingRecurring.slice(0, 2) : data.upcomingRecurring;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-amber-500" />
        <span className="font-semibold text-sm">Proximos Vencimientos</span>
      </div>
      <div className="space-y-1.5">
        {items.map((r) => {
          const daysLeft = differenceInDays(new Date(r.nextDueDate), new Date());
          return (
            <div key={r.id} className="flex items-center gap-2.5 py-1.5">
              <div className="shrink-0 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                {r.type === "INCOME" ? (
                  <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(r.nextDueDate), "d MMM", { locale: es })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-sm font-semibold",
                  r.type === "INCOME" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {formatCurrency(r.amount, r.currency)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {daysLeft === 0 ? "Hoy" : daysLeft === 1 ? "Manana" : `en ${daysLeft}d`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarMiniWidget() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust to start week on Monday
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const dayNames = ["L", "M", "X", "J", "V", "S", "D"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="p-4 space-y-2">
      <div className="text-center">
        <span className="font-semibold text-sm capitalize">
          {format(now, "MMMM yyyy", { locale: es })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map((d) => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "text-xs h-7 flex items-center justify-center rounded-lg transition-colors",
              day === today
                ? "bg-primary text-primary-foreground font-bold"
                : day
                  ? "text-foreground hover:bg-muted/50"
                  : ""
            )}
          >
            {day ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksSummaryWidget({ data, size }: { data: DashboardData; size: WidgetSize }) {
  if (size === "small") {
    return (
      <div className="p-4 flex items-center gap-3">
        <ListTodo className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="flex-1">
          <p className="text-lg font-bold leading-tight">{data.tasksSummary.todayPending}</p>
          <p className="text-[11px] text-muted-foreground">Pendientes hoy</p>
        </div>
        {data.tasksSummary.overdue > 0 && (
          <Badge variant="destructive" className="text-[10px]">
            {data.tasksSummary.overdue} vencidas
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ListTodo className="h-5 w-5 text-blue-500" />
        <span className="font-semibold text-sm">Tareas Pendientes</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.tasksSummary.todayPending}
          </p>
          <p className="text-[11px] text-muted-foreground">Para hoy</p>
        </div>
        <div className={cn(
          "p-2.5 rounded-xl",
          data.tasksSummary.overdue > 0 ? "bg-red-500/10" : "bg-muted/50"
        )}>
          <p className={cn(
            "text-2xl font-bold",
            data.tasksSummary.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          )}>
            {data.tasksSummary.overdue}
          </p>
          <p className="text-[11px] text-muted-foreground">Vencidas</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{data.tasksSummary.completedThisWeek} completadas esta semana</span>
        <Link href="/tasks" className="text-primary hover:underline">
          Ver tareas
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// NEW VARIANT WIDGETS
// ==========================================

function TasksTodayWidget({ data }: { data: DashboardData }) {
  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm flex items-center gap-1.5"><ListTodo className="h-4 w-4 text-blue-500" /> Tareas de Hoy</span>
        <Badge variant="secondary" className="text-[10px]">{data.tasksSummary.todayPending} pendientes</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{data.tasksSummary.completedThisWeek} completadas esta semana · {data.tasksSummary.overdue} vencidas</p>
      <Link href="/tasks"><Button size="sm" variant="outline" className="w-full text-xs mt-1">Ver tareas</Button></Link>
    </div>
  );
}

function TasksOverdueWidget({ data, size }: { data: DashboardData; size: WidgetSize }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", data.tasksSummary.overdue > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-muted")}>
        <AlertTriangle className={cn("h-5 w-5", data.tasksSummary.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} />
      </div>
      <div>
        <p className={cn("text-2xl font-bold", data.tasksSummary.overdue > 0 ? "text-red-600 dark:text-red-400" : "")}>{data.tasksSummary.overdue}</p>
        <p className="text-[11px] text-muted-foreground">Tareas vencidas</p>
      </div>
    </div>
  );
}

function HabitsStreakWidget({ stats, size }: { stats: HabitStats; size: WidgetSize }) {
  return (
    <div className="p-4 text-center">
      <Flame className="h-8 w-8 mx-auto mb-1 text-orange-500" />
      <p className="text-3xl font-bold">{stats.bestStreak}</p>
      <p className="text-[11px] text-muted-foreground">Mejor racha (días)</p>
      {size !== "small" && <p className="text-xs text-muted-foreground mt-1">{stats.weekCompleted} completados esta semana</p>}
    </div>
  );
}

function HabitsChecklistWidget({ stats }: { stats: HabitStats }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm flex items-center gap-1.5"><Repeat className="h-4 w-4 text-violet-500" /> Check Rápido</span>
        <span className="text-sm font-bold">{stats.todayCompleted}/{stats.todayTotal}</span>
      </div>
      <Progress value={stats.todayProgress} className="h-2" />
      <p className="text-xs text-muted-foreground">{stats.todayProgress.toFixed(0)}% completado hoy</p>
      <Link href="/habits"><Button size="sm" variant="outline" className="w-full text-xs">Ir a hábitos</Button></Link>
    </div>
  );
}

function StudyExamsWidget({ stats, size }: { stats: StudyStats; size: WidgetSize }) {
  if (stats.upcomingExams.length === 0) {
    return (
      <div className="p-4 text-center">
        <BookOpen className="h-6 w-6 mx-auto mb-1 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Sin exámenes próximos</p>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-2">
      <span className="font-semibold text-sm flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-red-500" /> Exámenes</span>
      {stats.upcomingExams.slice(0, size === "small" ? 1 : 3).map((exam: { title: string; subjectName: string; daysLeft: number }, i: number) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{exam.title}</p>
            <p className="text-[11px] text-muted-foreground">{exam.subjectName}</p>
          </div>
          <Badge variant={exam.daysLeft <= 7 ? "destructive" : "secondary"} className="text-[10px] shrink-0">
            {exam.daysLeft}d
          </Badge>
        </div>
      ))}
    </div>
  );
}

function StudyQuickWidget({ stats, size }: { stats: StudyStats; size: WidgetSize }) {
  return (
    <div className="p-4 text-center space-y-2">
      <div className="text-2xl">📚</div>
      <p className="text-sm font-semibold">{stats.weekHours}h esta semana</p>
      <Link href="/study"><Button size="sm" className="gap-1 text-xs"><Play className="h-3.5 w-3.5" /> Estudiar</Button></Link>
    </div>
  );
}

function GoalsOverviewWidget({ data, size }: { data: DashboardData; size: WidgetSize }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
        <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
      </div>
      <div>
        <p className="text-2xl font-bold">{data.goalsSummary.activeGoals}</p>
        <p className="text-[11px] text-muted-foreground">Metas activas</p>
      </div>
    </div>
  );
}

function GoalsRequiredWidget({ data }: { data: DashboardData }) {
  const goal = data.goalsSummary.closestGoal;
  if (!goal) return <div className="p-4 text-center text-sm text-muted-foreground">Sin metas activas</div>;
  return (
    <div className="p-4 space-y-2">
      <span className="font-semibold text-sm flex items-center gap-1.5"><Target className="h-4 w-4 text-violet-500" /> Necesitás por día</span>
      <div className="text-center py-2">
        <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">${goal.requiredPerDayForMin.toFixed(0)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{goal.name} · {goal.daysRemaining}d</p>
      </div>
      <Progress value={goal.progressVsMin} className="h-1.5" />
    </div>
  );
}

function GymWeekWidget({ stats, size }: { stats: GymStats; size: WidgetSize }) {
  return (
    <div className="p-4 space-y-2">
      <span className="font-semibold text-sm flex items-center gap-1.5"><Dumbbell className="h-4 w-4 text-rose-500" /> Esta Semana</span>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
          <p className="text-[10px] text-muted-foreground">Sesiones</p>
        </div>
        {size !== "small" && (
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-[10px] text-muted-foreground">Racha</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GymNextWidget({ stats, size }: { stats: GymStats; size: WidgetSize }) {
  return (
    <div className="p-4 text-center space-y-2">
      <div className="text-2xl">💪</div>
      <p className="text-sm font-semibold">{stats.total} entrenamientos</p>
      <Link href="/gym"><Button size="sm" variant="outline" className="gap-1 text-xs"><Play className="h-3.5 w-3.5" /> Entrenar</Button></Link>
    </div>
  );
}

// ==========================================
// SORTABLE WIDGET WRAPPER (Drag & Drop)
// ==========================================

function sizeToColSpanStatic(size: WidgetSize): string {
  return size === "large" ? "sm:col-span-2" : "sm:col-span-1";
}

function SortableWidget({
  widget, editMode, cardClass, onToggleSize, onRemove, children,
}: {
  widget: WidgetConfig;
  editMode: boolean;
  cardClass: string;
  onToggleSize: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: widget.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("relative group", sizeToColSpanStatic(widget.size))}
    >
      <Card className={cn("overflow-hidden h-full", cardClass, isDragging && "shadow-2xl ring-2 ring-primary")}>
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>

      {editMode && (
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 z-10">
          {/* Drag handle - top area */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm shadow-sm">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {getWidgetDefinition(widget.type)?.icon} {getWidgetDefinition(widget.type)?.label}
              </span>
            </div>
          </div>

          {/* Action buttons - bottom right */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-xl shadow-sm"
              onClick={onToggleSize}
              title={`Tamaño: ${widget.size}`}
            >
              {widget.size === "small" ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : widget.size === "large" ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-xl shadow-sm text-destructive hover:text-destructive"
              onClick={onRemove}
              title="Eliminar"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
