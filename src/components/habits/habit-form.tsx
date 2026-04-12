"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import { createHabit, updateHabit } from "@/actions/habits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Hash, Clock, DollarSign, Ban } from "lucide-react";

const TYPES = [
  { value: "CHECKBOX", label: "Sí/No", icon: CheckCircle2, desc: "Completar o no" },
  { value: "COUNT", label: "Conteo", icon: Hash, desc: "Contar hacia meta" },
  { value: "DURATION", label: "Duración", icon: Clock, desc: "Minutos" },
  { value: "AMOUNT", label: "Monto", icon: DollarSign, desc: "Dinero" },
  { value: "AVOID", label: "Evitar", icon: Ban, desc: "No hacerlo" },
];

const TIMES = [
  { value: "morning", label: "Mañana", emoji: "☀️" },
  { value: "afternoon", label: "Tarde", emoji: "🌤️" },
  { value: "evening", label: "Noche", emoji: "🌙" },
  { value: "flexible", label: "Flexible", emoji: "🔄" },
];

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"];

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: { id: string; title: string; description?: string | null; type: string; targetValue?: number | null; unit?: string | null; frequencyType: string; timeOfDay?: string | null; category?: string | null; color?: string | null; motivationNote?: string | null } | null;
}

export function HabitForm({ open, onOpenChange, habit }: HabitFormProps) {
  const isEditing = !!habit;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("CHECKBOX");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [frequencyType, setFrequencyType] = useState("DAILY");
  const [timeOfDay, setTimeOfDay] = useState("flexible");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState(COLORS[4]);
  const [motivationNote, setMotivationNote] = useState("");

  useEffect(() => {
    if (habit) {
      setTitle(habit.title); setDescription(habit.description ?? ""); setType(habit.type);
      setTargetValue(habit.targetValue?.toString() ?? ""); setUnit(habit.unit ?? "");
      setFrequencyType(habit.frequencyType); setTimeOfDay(habit.timeOfDay ?? "flexible");
      setCategory(habit.category ?? ""); setColor(habit.color ?? COLORS[4]);
      setMotivationNote(habit.motivationNote ?? "");
    } else {
      setTitle(""); setDescription(""); setType("CHECKBOX"); setTargetValue(""); setUnit("");
      setFrequencyType("DAILY"); setTimeOfDay("flexible"); setCategory(""); setColor(COLORS[4]); setMotivationNote("");
    }
  }, [habit, open]);

  const showTarget = ["COUNT", "DURATION", "AMOUNT"].includes(type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const data = {
        title: title.trim(), description: description.trim() || undefined, type, color,
        targetValue: showTarget ? Number(targetValue) || undefined : undefined,
        unit: showTarget ? unit.trim() || undefined : undefined,
        frequencyType, timeOfDay, category: category || undefined,
        motivationNote: motivationNote.trim() || undefined,
      };
      if (isEditing) { await updateHabit(habit!.id, data); toast.success("Hábito actualizado"); }
      else { await createHabit(data); toast.success("Hábito creado"); }
      onOpenChange(false);
    } catch (err) { console.error("HabitForm.handleSubmit:", err); toast.error("Error al guardar"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle>{isEditing ? "Editar Hábito" : "Nuevo Hábito"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="p-5 pt-4 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Nombre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Tomar 2L de agua" autoFocus />
          </div>

          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const selected = type === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className={cn("flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center",
                      selected ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent"
                    )}>
                    <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-[10px] font-medium", selected ? "text-primary" : "text-muted-foreground")}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target + Unit (conditional) */}
          {showTarget && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Meta diaria</Label>
                <Input type="number" inputMode="numeric" value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={type === "DURATION" ? "30" : type === "AMOUNT" ? "5" : "8"} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Unidad</Label>
                <Input value={unit} onChange={(e) => setUnit(e.target.value)}
                  placeholder={type === "DURATION" ? "minutos" : type === "AMOUNT" ? "USD" : "vasos"} />
              </div>
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Frecuencia</Label>
            <NativeSelect value={frequencyType} onChange={(e) => setFrequencyType(e.target.value)}>
              <option value="DAILY">Diario</option>
              <option value="WEEKDAYS">Lunes a Viernes</option>
              <option value="SPECIFIC_DAYS">Días específicos</option>
              <option value="X_PER_WEEK">X veces por semana</option>
            </NativeSelect>
          </div>

          {/* Time of day */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Momento del día</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TIMES.map((t) => (
                <button key={t.value} type="button" onClick={() => setTimeOfDay(t.value)}
                  className={cn("flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 transition-all",
                    timeOfDay === t.value ? "border-primary bg-primary/5" : "border-transparent hover:bg-accent"
                  )}>
                  <span className="text-base">{t.emoji}</span>
                  <span className="text-[10px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Categoría</Label>
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Sin categoría</option>
                <option value="Salud">Salud</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Productividad">Productividad</option>
                <option value="Bienestar">Bienestar</option>
                <option value="Estudio">Estudio</option>
                <option value="Deporte">Deporte</option>
                <option value="Otro">Otro</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map((c) => (
                  <button key={c} type="button"
                    className={cn("size-7 rounded-full border-2 transition-all", color === c ? "border-foreground scale-110" : "border-transparent")}
                    style={{ backgroundColor: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
          </div>

          {/* Motivation */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Motivación (opcional)</Label>
            <Textarea value={motivationNote} onChange={(e) => setMotivationNote(e.target.value)}
              placeholder="¿Por qué querés este hábito?" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Guardar" : "Crear Hábito"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
