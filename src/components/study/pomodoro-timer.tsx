"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Play, Pause, SkipForward, Square, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { completeSession } from "@/actions/study";
import { METHOD_CONFIG, type MethodKey } from "./quick-session-dialog";

interface Props {
  session: {
    id: string;
    method: string;
    pomodoroTarget: number | null;
  };
  subjectName?: string;
  topicName?: string;
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = "focus" | "break" | "longBreak";

export function PomodoroTimer({ session, subjectName, topicName, onComplete, onCancel }: Props) {
  const config = METHOD_CONFIG[session.method as MethodKey] || METHOD_CONFIG.pomodoro_25_5;
  const isFreeMode = session.method === "free";

  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(isFreeMode ? 0 : config.focusMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [interruptions, setInterruptions] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [focusScore, setFocusScore] = useState(0);
  const [sessionNotes, setSessionNotes] = useState("");
  const startTimeRef = useRef<Date>(new Date());

  const target = session.pomodoroTarget || 4;

  const handlePhaseEnd = useCallback(() => {
    if (phase === "focus") {
      const newCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newCompleted);

      // Check if target reached
      if (newCompleted >= target) {
        setIsRunning(false);
        setShowComplete(true);
        return;
      }

      // Determine break type
      const isLongBreak = config.longBreakAfter > 0 && newCompleted % config.longBreakAfter === 0;
      if (isLongBreak && config.longBreakMin > 0) {
        setPhase("longBreak");
        setSecondsLeft(config.longBreakMin * 60);
      } else {
        setPhase("break");
        setSecondsLeft(config.breakMin * 60);
      }
    } else {
      // Break ended, start new focus
      setPhase("focus");
      setSecondsLeft(config.focusMin * 60);
    }
  }, [phase, pomodorosCompleted, target, config]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (isFreeMode) {
        // Count up in free mode
        setSecondsLeft((s) => s + 1);
        setTotalFocusSeconds((s) => s + 1);
      } else {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handlePhaseEnd();
            return 0;
          }
          return prev - 1;
        });
        if (phase === "focus") {
          setTotalFocusSeconds((s) => s + 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isFreeMode, phase, handlePhaseEnd]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSkipBreak = () => {
    setPhase("focus");
    setSecondsLeft(config.focusMin * 60);
  };

  const handleEndSession = () => {
    setIsRunning(false);
    setShowComplete(true);
  };

  const handleSaveComplete = async () => {
    try {
      const durationMin = Math.round(totalFocusSeconds / 60);
      await completeSession(session.id, {
        actualDurationMin: durationMin || 1,
        pomodoroCompleted: pomodorosCompleted,
        interruptionCount: interruptions,
        focusScore: focusScore || undefined,
        notes: sessionNotes.trim() || undefined,
      });
      toast.success("Sesion completada");
      onComplete();
    } catch (err) {
      console.error("PomodoroTimer.handleSaveComplete:", err);
      toast.error("Error al guardar la sesion");
    }
  };

  // Progress circle calculation
  const totalPhaseSecs = isFreeMode
    ? 1
    : phase === "focus"
    ? config.focusMin * 60
    : phase === "longBreak"
    ? config.longBreakMin * 60
    : config.breakMin * 60;
  const progress = isFreeMode ? 1 : (totalPhaseSecs - secondsLeft) / totalPhaseSecs;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const phaseLabel = phase === "focus" ? "Enfoque" : phase === "longBreak" ? "Descanso Largo" : "Descanso";
  const phaseColor = phase === "focus" ? "#3b82f6" : "#10b981";

  // Completion dialog
  if (showComplete) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sesion Finalizada</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="text-center space-y-1">
              <p className="text-3xl font-bold">{formatTime(totalFocusSeconds)}</p>
              <p className="text-sm text-muted-foreground">Tiempo de enfoque total</p>
              {!isFreeMode && (
                <p className="text-sm text-muted-foreground">
                  {pomodorosCompleted} de {target} 🍅
                </p>
              )}
            </div>

            {/* Focus Score */}
            <div className="space-y-2">
              <Label>Puntuacion de enfoque</Label>
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFocusScore(i + 1)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`size-7 ${
                        i < focusScore
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Interruptions */}
            <div className="space-y-2">
              <Label>Interrupciones</Label>
              <Input
                type="number"
                min={0}
                value={interruptions}
                onChange={(e) => setInterruptions(parseInt(e.target.value) || 0)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                placeholder="Como fue la sesion?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="min-h-15"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Descartar
            </Button>
            <Button onClick={handleSaveComplete}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Header info */}
      <div className="text-center mb-6 space-y-1">
        <p className="text-sm text-muted-foreground">
          {config.icon} {config.label}
        </p>
        {subjectName && (
          <p className="text-[15px] font-medium">{subjectName}</p>
        )}
        {topicName && (
          <p className="text-xs text-muted-foreground">{topicName}</p>
        )}
      </div>

      {/* Phase indicator */}
      <div
        className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
        style={{
          backgroundColor: phase === "focus" ? "#3b82f620" : "#10b98120",
          color: phaseColor,
        }}
      >
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: phaseColor }}
        />
        {phaseLabel}
      </div>

      {/* Circular Timer */}
      <div className="relative mb-8">
        <svg width="280" height="280" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={phaseColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-light tracking-tight tabular-nums">
            {formatTime(secondsLeft)}
          </span>
          {!isFreeMode && (
            <span className="text-sm text-muted-foreground mt-2">
              {pomodorosCompleted} de {target} 🍅
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {phase !== "focus" && !isFreeMode && (
          <Button
            variant="outline"
            size="lg"
            onClick={handleSkipBreak}
            className="gap-2 rounded-2xl"
          >
            <SkipForward className="size-4" />
            Saltar descanso
          </Button>
        )}

        <Button
          size="lg"
          onClick={() => {
            if (!isRunning && totalFocusSeconds === 0) {
              startTimeRef.current = new Date();
            }
            setIsRunning(!isRunning);
            if (isRunning) setInterruptions((i) => i + 1);
          }}
          className="h-16 w-16 rounded-full text-lg"
        >
          {isRunning ? <Pause className="size-6" /> : <Play className="size-6 ml-0.5" />}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleEndSession}
          className="gap-2 rounded-2xl"
        >
          <Square className="size-4" />
          Terminar
        </Button>
      </div>

      {/* Cancel link */}
      <button
        type="button"
        onClick={onCancel}
        className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancelar sesion
      </button>
    </div>
  );
}
