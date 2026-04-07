export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "ARS", name: "Argentine Peso", symbol: "$" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  BANK: "Banco",
  VIRTUAL_WALLET: "Billetera Virtual",
  SAVINGS: "Ahorro",
  INVESTMENT: "Inversión",
  CREDIT_CARD: "Tarjeta de Crédito",
  CRYPTO: "Crypto",
  OTHER: "Otro",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  DEBIT: "Débito",
  CREDIT: "Crédito",
  TRANSFER: "Transferencia",
  VIRTUAL_WALLET: "Billetera Virtual",
  CRYPTO: "Crypto",
  OTHER: "Otro",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const GOAL_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activa",
  PAUSED: "Pausada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  INCOME: "Ingreso",
  EXPENSE: "Gasto",
  TRANSFER: "Transferencia",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
  CUSTOM: "Personalizado",
};

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Sueldo", icon: "💼" },
  { name: "Freelance", icon: "💻" },
  { name: "Ventas", icon: "🛒" },
  { name: "Intereses", icon: "🏦" },
  { name: "Regalos", icon: "🎁" },
  { name: "Otros Ingresos", icon: "💰" },
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Comida", icon: "🍕" },
  { name: "Transporte", icon: "🚗" },
  { name: "Alquiler", icon: "🏠" },
  { name: "Servicios", icon: "💡" },
  { name: "Salud", icon: "🏥" },
  { name: "Educación", icon: "📚" },
  { name: "Ocio", icon: "🎮" },
  { name: "Suscripciones", icon: "📺" },
  { name: "Deudas", icon: "💳" },
  { name: "Inversión", icon: "📈" },
  { name: "Compras", icon: "🛍️" },
  { name: "Impuestos", icon: "🏛️" },
  { name: "Otros Gastos", icon: "📦" },
];

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};
