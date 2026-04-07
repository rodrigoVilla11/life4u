"use client";

import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Search, Plus, Dumbbell, ChevronRight, Star } from "lucide-react";
import {
  EXERCISE_DATABASE, ALL_MUSCLE_GROUPS, ALL_EQUIPMENT,
  searchExercises, MUSCLE_COLORS,
  type ExerciseTemplate,
} from "@/lib/exercise-database";

interface ExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: ExerciseTemplate) => void;
  onCustom: () => void; // fallback to create custom exercise
}

const DIFFICULTY_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ExercisePicker({ open, onOpenChange, onSelect, onCustom }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseTemplate | null>(null);

  const results = useMemo(
    () => searchExercises(query, muscleFilter || undefined, equipmentFilter || undefined),
    [query, muscleFilter, equipmentFilter]
  );

  // Group by muscle
  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseTemplate[]>();
    for (const ex of results) {
      if (!map.has(ex.muscleGroup)) map.set(ex.muscleGroup, []);
      map.get(ex.muscleGroup)!.push(ex);
    }
    return Array.from(map.entries());
  }, [results]);

  function handleSelect(exercise: ExerciseTemplate) {
    setSelectedExercise(exercise);
  }

  function handleConfirm() {
    if (selectedExercise) {
      onSelect(selectedExercise);
      setSelectedExercise(null);
      setQuery("");
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSelectedExercise(null); setQuery(""); } }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Detail view */}
        {selectedExercise ? (
          <div className="p-5 space-y-5">
            <SheetHeader className="mb-0">
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left mb-2"
              >
                ← Volver a la lista
              </button>
              <SheetTitle className="text-xl">{selectedExercise.name}</SheetTitle>
            </SheetHeader>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden bg-muted aspect-video flex items-center justify-center">
              <img
                src={selectedExercise.image}
                alt={selectedExercise.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="flex flex-col items-center justify-center h-full"><svg class="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg><p class="text-xs text-muted-foreground mt-2">Sin imagen</p></div>`;
                }}
              />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge style={{ backgroundColor: `${MUSCLE_COLORS[selectedExercise.muscleGroup] ?? "#6b7280"}20`, color: MUSCLE_COLORS[selectedExercise.muscleGroup] ?? "#6b7280" }}>
                {selectedExercise.muscleGroup}
              </Badge>
              {selectedExercise.secondaryMuscles.map((m) => (
                <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
              ))}
              <Badge className={`text-[11px] ${DIFFICULTY_COLORS[selectedExercise.difficulty]}`}>
                {DIFFICULTY_LABELS[selectedExercise.difficulty]}
              </Badge>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Equipamiento</p>
                <p className="text-sm">{selectedExercise.equipment}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Instrucciones</p>
                <p className="text-sm leading-relaxed">{selectedExercise.instructions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Músculos trabajados</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-sm font-medium" style={{ color: MUSCLE_COLORS[selectedExercise.muscleGroup] }}>
                    {selectedExercise.muscleGroup} (principal)
                  </span>
                  {selectedExercise.secondaryMuscles.map((m) => (
                    <span key={m} className="text-sm text-muted-foreground">· {m}</span>
                  ))}
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full h-12 text-base font-semibold gap-2" onClick={handleConfirm}>
              <Plus className="h-5 w-5" />
              Agregar a la rutina
            </Button>
          </div>
        ) : (
          /* List view */
          <div className="flex flex-col h-full">
            <div className="p-5 pb-3 space-y-3 border-b">
              <SheetHeader className="mb-0">
                <SheetTitle>Elegir ejercicio</SheetTitle>
              </SheetHeader>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar ejercicio..."
                  className="pl-10"
                  autoFocus
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <NativeSelect value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="flex-1 text-sm">
                  <option value="">Todos los músculos</option>
                  {ALL_MUSCLE_GROUPS.map((m) => <option key={m} value={m}>{m}</option>)}
                </NativeSelect>
                <NativeSelect value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)} className="flex-1 text-sm">
                  <option value="">Todo equipo</option>
                  {ALL_EQUIPMENT.map((e) => <option key={e} value={e}>{e}</option>)}
                </NativeSelect>
              </div>

              <p className="text-xs text-muted-foreground">{results.length} ejercicios</p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {grouped.map(([muscle, exercises]) => (
                <div key={muscle}>
                  <div className="px-5 py-2 bg-muted/50 sticky top-0 z-10">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUSCLE_COLORS[muscle] ?? "#6b7280" }}>
                      {muscle} ({exercises.length})
                    </p>
                  </div>
                  {exercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelect(ex)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-accent/40 active:bg-accent/60 transition-colors text-left"
                    >
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-muted overflow-hidden"
                      >
                        <img
                          src={ex.image}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<svg class="h-5 w-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="1.5"/></svg>`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[15px] truncate">{ex.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{ex.equipment}</span>
                          {ex.secondaryMuscles.length > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              · {ex.secondaryMuscles.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    </button>
                  ))}
                </div>
              ))}

              {results.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground mb-4">No se encontraron ejercicios</p>
                  <Button variant="outline" onClick={onCustom} className="gap-2">
                    <Plus className="h-4 w-4" /> Crear ejercicio personalizado
                  </Button>
                </div>
              )}
            </div>

            {/* Custom exercise button */}
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full gap-2" onClick={onCustom}>
                <Plus className="h-4 w-4" /> Crear ejercicio personalizado
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
