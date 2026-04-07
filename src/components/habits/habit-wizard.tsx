"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createHabit } from "@/actions/habits";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  { id: "salud", label: "Salud", emoji: "💪", color: "#10b981" },
  { id: "finanzas", label: "Ahorrar", emoji: "💰", color: "#3b82f6" },
  { id: "estudio", label: "Estudiar", emoji: "📚", color: "#8b5cf6" },
  { id: "productividad", label: "Productividad", emoji: "⚡", color: "#f59e0b" },
  { id: "bienestar", label: "Bienestar", emoji: "🧘", color: "#ec4899" },
  { id: "ordenar", label: "Ordenar el día", emoji: "📋", color: "#06b6d4" },
];

type SuggestionData = { title: string; icon: string; type: string; targetValue?: number; unit?: string; desc: string };

const SUGGESTIONS: Record<string, SuggestionData[]> = {
  salud: [
    { title: "Tomar 2L de agua", icon: "💧", type: "COUNT", targetValue: 8, unit: "vasos", desc: "8 vasos al día" },
    { title: "Meditar 5 minutos", icon: "🧘", type: "DURATION", targetValue: 5, unit: "minutos", desc: "Solo 5 min de calma" },
    { title: "Caminar 30 minutos", icon: "🚶", type: "DURATION", targetValue: 30, unit: "minutos", desc: "Un paseo corto" },
    { title: "Dormir antes de las 00:00", icon: "😴", type: "CHECKBOX", desc: "Descansar mejor" },
  ],
  finanzas: [
    { title: "Ahorrar $5 por día", icon: "💵", type: "AMOUNT", targetValue: 5, unit: "USD", desc: "$150 al mes" },
    { title: "No pedir delivery", icon: "🚫", type: "AVOID", desc: "Cocinar es más sano" },
    { title: "Revisar gastos del día", icon: "📊", type: "CHECKBOX", desc: "5 minutos de revisión" },
  ],
  estudio: [
    { title: "Estudiar 30 minutos", icon: "📖", type: "DURATION", targetValue: 30, unit: "minutos", desc: "Sesión enfocada" },
    { title: "Leer 10 páginas", icon: "📚", type: "COUNT", targetValue: 10, unit: "páginas", desc: "300 pág/mes" },
    { title: "Practicar idioma 15 min", icon: "🌍", type: "DURATION", targetValue: 15, unit: "minutos", desc: "Consistencia > intensidad" },
  ],
  productividad: [
    { title: "Planificar el día", icon: "📝", type: "CHECKBOX", desc: "Empezar con claridad" },
    { title: "No redes sociales 1h", icon: "📵", type: "AVOID", desc: "Enfoque profundo" },
    { title: "Leer 1 artículo", icon: "📰", type: "COUNT", targetValue: 1, unit: "artículos", desc: "Aprender algo nuevo" },
  ],
  bienestar: [
    { title: "3 gratitudes del día", icon: "🙏", type: "COUNT", targetValue: 3, unit: "gratitudes", desc: "Perspectiva positiva" },
    { title: "Hacer la cama", icon: "🛏️", type: "CHECKBOX", desc: "Empezar el día con orden" },
    { title: "Sin celular 30 min", icon: "📱", type: "DURATION", targetValue: 30, unit: "minutos", desc: "Desconectarse" },
  ],
  ordenar: [
    { title: "Limpiar 10 minutos", icon: "🧹", type: "DURATION", targetValue: 10, unit: "minutos", desc: "Un poco cada día" },
    { title: "Revisar pendientes", icon: "✅", type: "CHECKBOX", desc: "Nada se escapa" },
    { title: "Ordenar escritorio", icon: "🗂️", type: "CHECKBOX", desc: "Mente clara, espacio claro" },
  ],
};

const FREQUENCIES = [
  { value: "DAILY", label: "Todos los días", desc: "Máxima constancia" },
  { value: "WEEKDAYS", label: "Lunes a Viernes", desc: "Descanso en finde" },
  { value: "X_PER_WEEK", label: "3 veces por semana", desc: "Empezar suave" },
];

const TIMES = [
  { value: "morning", label: "Mañana", emoji: "☀️" },
  { value: "afternoon", label: "Tarde", emoji: "🌤️" },
  { value: "evening", label: "Noche", emoji: "🌙" },
  { value: "flexible", label: "Flexible", emoji: "🔄" },
];

export function HabitWizard({ open, onOpenChange }: HabitWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionData | null>(null);
  const [frequency, setFrequency] = useState("DAILY");
  const [timeOfDay, setTimeOfDay] = useState("flexible");
  const [loading, setLoading] = useState(false);

  function reset() {
    setStep(0); setSelectedCategory(""); setSelectedSuggestion(null);
    setFrequency("DAILY"); setTimeOfDay("flexible");
  }

  async function handleCreate() {
    if (!selectedSuggestion) return;
    setLoading(true);
    try {
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      await createHabit({
        title: selectedSuggestion.title,
        icon: selectedSuggestion.icon,
        type: selectedSuggestion.type,
        targetValue: selectedSuggestion.targetValue,
        unit: selectedSuggestion.unit,
        frequencyType: frequency,
        frequencyCount: frequency === "X_PER_WEEK" ? 3 : undefined,
        timeOfDay,
        category: cat?.label,
        color: cat?.color,
      });
      toast.success("¡Hábito creado!");
      reset();
      onOpenChange(false);
    } catch { toast.error("Error al crear hábito"); }
    finally { setLoading(false); }
  }

  const suggestions = SUGGESTIONS[selectedCategory] ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("h-2 rounded-full transition-all duration-300",
              i === step ? "w-6 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
            )} />
          ))}
        </div>

        <div className="p-5 pt-2 min-h-[400px] flex flex-col">
          {/* Back button */}
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
          )}

          {/* Step 0: Category */}
          {step === 0 && (
            <div className="space-y-4 flex-1">
              <div className="text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">¿Qué querés lograr?</h2>
                <p className="text-sm text-muted-foreground mt-1">Elegí un área y te sugerimos hábitos</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setStep(1); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-accent/30 transition-all active:scale-95">
                    <span className="text-3xl">{cat.emoji}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Suggestions */}
          {step === 1 && (
            <div className="space-y-4 flex-1">
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight">Elegí un hábito</h2>
                <p className="text-sm text-muted-foreground mt-1">Podés personalizarlo después</p>
              </div>
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <button key={s.title} onClick={() => { setSelectedSuggestion(s); setStep(2); }}
                    className={cn("w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]",
                      selectedSuggestion?.title === s.title ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent/30"
                    )}>
                    <span className="text-2xl shrink-0">{s.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-[15px]">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Frequency */}
          {step === 2 && (
            <div className="space-y-4 flex-1">
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight">¿Qué tan seguido?</h2>
                <p className="text-sm text-muted-foreground mt-1">Empezar suave es mejor que no empezar</p>
              </div>
              <div className="space-y-2">
                {FREQUENCIES.map((f) => (
                  <button key={f.value} onClick={() => { setFrequency(f.value); setStep(3); }}
                    className={cn("w-full p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]",
                      frequency === f.value ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent/30"
                    )}>
                    <p className="font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Time of day */}
          {step === 3 && (
            <div className="space-y-4 flex-1">
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight">¿Cuándo te funciona mejor?</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TIMES.map((t) => (
                  <button key={t.value} onClick={() => { setTimeOfDay(t.value); setStep(4); }}
                    className={cn("flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all active:scale-95",
                      timeOfDay === t.value ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent/30"
                    )}>
                    <span className="text-3xl">{t.emoji}</span>
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && selectedSuggestion && (
            <div className="space-y-5 flex-1">
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-tight">¡Listo para empezar!</h2>
              </div>

              <Card className="bg-accent/30">
                <CardContent className="p-5 text-center space-y-3">
                  <span className="text-4xl">{selectedSuggestion.icon}</span>
                  <h3 className="text-lg font-bold">{selectedSuggestion.title}</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">{FREQUENCIES.find((f) => f.value === frequency)?.label}</Badge>
                    <Badge variant="secondary">{TIMES.find((t) => t.value === timeOfDay)?.emoji} {TIMES.find((t) => t.value === timeOfDay)?.label}</Badge>
                    {selectedSuggestion.targetValue && (
                      <Badge variant="secondary">Meta: {selectedSuggestion.targetValue} {selectedSuggestion.unit}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-sm">
                <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-800 dark:text-amber-300">
                  <strong>Tip:</strong> Empezá más chico de lo que pensás. Es mejor hacer poco todos los días que mucho 2 veces.
                </p>
              </div>

              <Button size="lg" className="w-full h-12 text-base font-semibold gap-2" onClick={handleCreate} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creando..." : "Crear Hábito"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
