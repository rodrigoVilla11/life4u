import type { GoalDiagnosis } from "./types";

export const DIAGNOSIS_CONFIG: Record<GoalDiagnosis, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
}> = {
  EXCELLENT: {
    label: "Vas muy bien",
    description: "Estás por encima del ritmo ideal",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    emoji: "🚀",
  },
  ON_TRACK: {
    label: "Vas bien",
    description: "Estás dentro del ritmo esperado",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    emoji: "✅",
  },
  BEHIND: {
    label: "Ajustá",
    description: "Estás por debajo del ritmo mínimo",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    emoji: "⚠️",
  },
  CRITICAL: {
    label: "Muy atrasado",
    description: "Necesitás aumentar el ahorro urgentemente",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    emoji: "🔴",
  },
  COMPLETED: {
    label: "Meta alcanzada",
    description: "¡Felicitaciones! Llegaste a tu objetivo",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    emoji: "🎉",
  },
  NO_DEADLINE: {
    label: "Sin fecha límite",
    description: "No hay fecha objetivo definida",
    color: "text-gray-700 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    emoji: "📅",
  },
};
