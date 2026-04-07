export type WidgetSize = "small" | "medium" | "large";

export interface WidgetConfig {
  id: string;
  type: string;
  visible: boolean;
  size: WidgetSize;
  position: number;
}

export interface WidgetDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
  module?: string;
  category: string; // grouping for the picker
}

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  // ==========================================
  // GENERAL
  // ==========================================
  { type: "quick_actions", label: "Acciones Rápidas", description: "Botones para crear tareas, gastos y metas", icon: "⚡", defaultSize: "large", allowedSizes: ["large"], category: "General" },
  { type: "stats", label: "Resumen del Día", description: "Tareas pendientes, vencidas, balance y ahorro", icon: "📊", defaultSize: "large", allowedSizes: ["large"], category: "General" },
  { type: "calendar_mini", label: "Mini Calendario", description: "Vista compacta del mes con indicador de hoy", icon: "🗓️", defaultSize: "medium", allowedSizes: ["medium", "large"], module: "calendar", category: "General" },

  // ==========================================
  // TAREAS (3 variantes)
  // ==========================================
  { type: "tasks_summary", label: "Tareas - Resumen", description: "Pendientes hoy y vencidas en números", icon: "✅", defaultSize: "small", allowedSizes: ["small", "medium"], module: "tasks", category: "Tareas" },
  { type: "tasks_today", label: "Tareas - Hoy", description: "Lista de tareas para hoy con check rápido", icon: "📋", defaultSize: "medium", allowedSizes: ["medium", "large"], module: "tasks", category: "Tareas" },
  { type: "tasks_overdue", label: "Tareas - Vencidas", description: "Tareas vencidas que necesitan atención", icon: "⚠️", defaultSize: "small", allowedSizes: ["small", "medium"], module: "tasks", category: "Tareas" },

  // ==========================================
  // FINANZAS (3 variantes)
  // ==========================================
  { type: "finance_summary", label: "Finanzas - Balance", description: "Ingresos, gastos y balance del mes", icon: "💰", defaultSize: "medium", allowedSizes: ["small", "medium", "large"], module: "finances", category: "Finanzas" },
  { type: "finance_chart", label: "Finanzas - Gráfico", description: "Gráfico de barras ingresos vs gastos", icon: "📈", defaultSize: "large", allowedSizes: ["medium", "large"], module: "finances", category: "Finanzas" },
  { type: "recent_transactions", label: "Finanzas - Movimientos", description: "Últimas transacciones con monto y categoría", icon: "💸", defaultSize: "large", allowedSizes: ["medium", "large"], module: "finances", category: "Finanzas" },

  // ==========================================
  // HÁBITOS (3 variantes)
  // ==========================================
  { type: "habits_today", label: "Hábitos - Progreso", description: "Progreso del día con barra y porcentaje", icon: "🔄", defaultSize: "medium", allowedSizes: ["small", "medium", "large"], module: "habits", category: "Hábitos" },
  { type: "habits_streak", label: "Hábitos - Racha", description: "Mejor racha y completados esta semana", icon: "🔥", defaultSize: "small", allowedSizes: ["small", "medium"], module: "habits", category: "Hábitos" },
  { type: "habits_checklist", label: "Hábitos - Check Rápido", description: "Lista de hábitos de hoy para completar", icon: "☑️", defaultSize: "large", allowedSizes: ["medium", "large"], module: "habits", category: "Hábitos" },

  // ==========================================
  // ESTUDIO (3 variantes)
  // ==========================================
  { type: "study_focus", label: "Estudio - Resumen", description: "Horas, pomodoros y próximo examen", icon: "📚", defaultSize: "medium", allowedSizes: ["small", "medium"], module: "study", category: "Estudio" },
  { type: "study_exams", label: "Estudio - Exámenes", description: "Próximos exámenes con countdown", icon: "📝", defaultSize: "medium", allowedSizes: ["small", "medium", "large"], module: "study", category: "Estudio" },
  { type: "study_quick", label: "Estudio - Iniciar Sesión", description: "Botón rápido para empezar a estudiar", icon: "🎯", defaultSize: "small", allowedSizes: ["small", "medium"], module: "study", category: "Estudio" },

  // ==========================================
  // METAS (3 variantes)
  // ==========================================
  { type: "goals_progress", label: "Metas - Progreso", description: "Meta más cercana con barra y necesitás/día", icon: "🎯", defaultSize: "medium", allowedSizes: ["small", "medium"], module: "goals", category: "Metas" },
  { type: "goals_overview", label: "Metas - Resumen", description: "Total ahorrado y cantidad de metas activas", icon: "💎", defaultSize: "small", allowedSizes: ["small", "medium"], module: "goals", category: "Metas" },
  { type: "goals_required", label: "Metas - Necesitás/Día", description: "Cuánto ahorrar por día para cada meta", icon: "📐", defaultSize: "medium", allowedSizes: ["small", "medium", "large"], module: "goals", category: "Metas" },

  // ==========================================
  // GIMNASIO (3 variantes)
  // ==========================================
  { type: "gym_stats", label: "Gym - Resumen", description: "Entrenamientos totales, semana y racha", icon: "💪", defaultSize: "small", allowedSizes: ["small", "medium"], module: "gym", category: "Gimnasio" },
  { type: "gym_week", label: "Gym - Esta Semana", description: "Entrenamientos de la semana con detalle", icon: "🏋️", defaultSize: "medium", allowedSizes: ["small", "medium"], module: "gym", category: "Gimnasio" },
  { type: "gym_next", label: "Gym - Próximo Entrenamiento", description: "Siguiente rutina sugerida", icon: "▶️", defaultSize: "small", allowedSizes: ["small", "medium"], module: "gym", category: "Gimnasio" },

  // ==========================================
  // RECURRENTES
  // ==========================================
  { type: "upcoming_recurring", label: "Próximos Vencimientos", description: "Gastos e ingresos recurrentes próximos", icon: "📅", defaultSize: "medium", allowedSizes: ["small", "medium"], module: "finances", category: "Finanzas" },
];

export const DEFAULT_WIDGET_CONFIG: WidgetConfig[] = [
  { id: "w1", type: "quick_actions", visible: true, size: "large", position: 0 },
  { id: "w2", type: "stats", visible: true, size: "large", position: 1 },
  { id: "w3", type: "habits_today", visible: true, size: "medium", position: 2 },
  { id: "w4", type: "finance_summary", visible: true, size: "medium", position: 3 },
  { id: "w5", type: "study_focus", visible: true, size: "medium", position: 4 },
  { id: "w6", type: "goals_progress", visible: true, size: "medium", position: 5 },
  { id: "w7", type: "finance_chart", visible: true, size: "large", position: 6 },
  { id: "w8", type: "recent_transactions", visible: true, size: "large", position: 7 },
  { id: "w9", type: "gym_stats", visible: true, size: "small", position: 8 },
  { id: "w10", type: "tasks_summary", visible: true, size: "small", position: 9 },
];

export function getWidgetDefinition(type: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY.find((w) => w.type === type);
}

// Get unique categories for the picker
export function getWidgetCategories(): string[] {
  return [...new Set(WIDGET_REGISTRY.map((w) => w.category))];
}
