"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createSession, startSession } from "@/actions/study";
import { PomodoroTimer } from "./pomodoro-timer";

export const METHOD_CONFIG = {
  pomodoro_25_5: { label: "Pomodoro 25/5", focusMin: 25, breakMin: 5, longBreakMin: 15, longBreakAfter: 4, icon: "🍅" },
  pomodoro_50_10: { label: "Pomodoro 50/10", focusMin: 50, breakMin: 10, longBreakMin: 20, longBreakAfter: 4, icon: "🍅" },
  deep_work: { label: "Deep Work", focusMin: 50, breakMin: 10, longBreakMin: 0, longBreakAfter: 0, icon: "🧠" },
  free: { label: "Sesion Libre", focusMin: 0, breakMin: 0, longBreakMin: 0, longBreakAfter: 0, icon: "⏱️" },
} as const;

export type MethodKey = keyof typeof METHOD_CONFIG;

interface Subject {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  topics: Array<{ id: string; title: string; status: string }>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
}

export function QuickSessionDialog({ open, onOpenChange, subjects }: Props) {
  const [isPending, startTransition] = useTransition();
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [method, setMethod] = useState<MethodKey>("pomodoro_25_5");
  const [pomodoroTarget, setPomodoroTarget] = useState("4");
  const [activeSession, setActiveSession] = useState<{
    id: string;
    method: string;
    pomodoroTarget: number | null;
    subjectName?: string;
    topicName?: string;
  } | null>(null);

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const topics = selectedSubject?.topics.filter((t) => t.status !== "completed") || [];

  const handleStart = () => {
    startTransition(async () => {
      try {
        const session = await createSession({
          subjectId: subjectId || undefined,
          topicId: topicId || undefined,
          method,
          pomodoroTarget: method !== "free" ? parseInt(pomodoroTarget) || 4 : undefined,
        });
        await startSession(session.id);

        setActiveSession({
          id: session.id,
          method,
          pomodoroTarget: method !== "free" ? parseInt(pomodoroTarget) || 4 : null,
          subjectName: session.subject?.name ?? undefined,
          topicName: session.topic?.title ?? undefined,
        });
      } catch {
        toast.error("Error al iniciar la sesion");
      }
    });
  };

  const handleTimerComplete = () => {
    setActiveSession(null);
    onOpenChange(false);
    setSubjectId("");
    setTopicId("");
    setMethod("pomodoro_25_5");
    setPomodoroTarget("4");
  };

  const handleTimerCancel = () => {
    setActiveSession(null);
  };

  // Show timer if session is active
  if (activeSession) {
    return (
      <PomodoroTimer
        session={activeSession}
        subjectName={activeSession.subjectName}
        topicName={activeSession.topicName}
        onComplete={handleTimerComplete}
        onCancel={handleTimerCancel}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Estudiar Ahora</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Subject */}
          <div className="space-y-2">
            <Label>Materia</Label>
            <NativeSelect
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId("");
              }}
            >
              <option value="">Seleccionar materia...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon || "📚"} {s.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          {/* Topic */}
          {topics.length > 0 && (
            <div className="space-y-2">
              <Label>Tema (opcional)</Label>
              <NativeSelect
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
              >
                <option value="">Sin tema especifico</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </NativeSelect>
            </div>
          )}

          {/* Method Cards */}
          <div className="space-y-2">
            <Label>Metodo de estudio</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(METHOD_CONFIG) as MethodKey[]).map((key) => {
                const config = METHOD_CONFIG[key];
                const isSelected = method === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMethod(key)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-[13px] font-medium">{config.label}</span>
                    {config.focusMin > 0 && (
                      <span className="text-[11px] text-muted-foreground">
                        {config.focusMin}min enfoque / {config.breakMin}min descanso
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pomodoro Target */}
          {method !== "free" && (
            <div className="space-y-2">
              <Label>Rondas objetivo</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={pomodoroTarget}
                onChange={(e) => setPomodoroTarget(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={isPending} className="gap-2">
            <Play className="size-4" />
            {isPending ? "Iniciando..." : "Empezar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
