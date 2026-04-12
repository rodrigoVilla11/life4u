"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, BookOpen, ClipboardList, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface SubjectCardProps {
  subject: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    difficulty: number | null;
    weeklyTargetHours: number | null;
    topics: Array<{ id: string; title: string; completedPercent: number; status: string }>;
    exams: Array<{ id: string; title: string; date: string; status: string }>;
    _count: { sessions: number; topics: number; exams: number };
  };
  onEdit: () => void;
}

export function SubjectCard({ subject, onEdit }: SubjectCardProps) {
  const router = useRouter();
  const [now] = useState(() => Date.now());

  const nextExam = subject.exams.find((e) => {
    const d = new Date(e.date);
    return d.getTime() >= now && e.status !== "done";
  });
  const daysToExam = nextExam
    ? Math.max(0, Math.ceil((new Date(nextExam.date).getTime() - now) / 86400000))
    : null;

  // Fake weekly hours progress (would need session data for real calc)
  const weeklyProgress = subject.weeklyTargetHours
    ? Math.min(100, Math.round(((subject._count.sessions * 0.5) / subject.weeklyTargetHours) * 100))
    : null;

  return (
    <Card
      className="rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md group relative overflow-hidden"
      onClick={() => router.push(`/study/${subject.id}`)}
    >
      {/* Color strip */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: subject.color || "#6b7280" }}
      />

      <CardContent className="p-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl shrink-0">{subject.icon || "📚"}</span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold truncate">{subject.name}</h3>
              {subject.difficulty && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${
                        i < subject.difficulty!
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ClipboardList className="size-3.5" />
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="size-3" />
            {subject._count.topics} temas
          </Badge>
          <Badge variant="secondary" className="gap-1">
            {subject._count.sessions} sesiones
          </Badge>
        </div>

        {/* Next exam countdown */}
        {nextExam && daysToExam !== null && (
          <div className="flex items-center gap-2 mt-3 text-xs">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {nextExam.title}:{" "}
              <span
                className={
                  daysToExam <= 3
                    ? "text-red-600 font-medium"
                    : daysToExam <= 7
                    ? "text-amber-600 font-medium"
                    : "text-muted-foreground"
                }
              >
                {daysToExam === 0 ? "Hoy" : daysToExam === 1 ? "Manana" : `en ${daysToExam} dias`}
              </span>
            </span>
          </div>
        )}

        {/* Weekly target progress */}
        {subject.weeklyTargetHours && weeklyProgress !== null && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Meta semanal</span>
              <span>{subject.weeklyTargetHours}h</span>
            </div>
            <Progress value={weeklyProgress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
