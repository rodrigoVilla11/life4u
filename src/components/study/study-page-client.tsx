"use client";

import { useState } from "react";
import { BookOpen, Clock, Timer, GraduationCap, CalendarDays, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SubjectCard } from "./subject-card";
import { SubjectForm } from "./subject-form";
import { QuickSessionDialog } from "./quick-session-dialog";

interface StudySubject {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  difficulty: number | null;
  status: string;
  weeklyTargetHours: number | null;
  teacher: string | null;
  notes: string | null;
  topics: Array<{ id: string; title: string; completedPercent: number; status: string }>;
  exams: Array<{ id: string; title: string; date: string; status: string }>;
  scheduleBlocks: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>;
  _count: { sessions: number; topics: number; exams: number };
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

interface StudySession {
  id: string;
  method: string;
  status: string;
  pomodoroCompleted: number;
  actualDurationMin: number | null;
  subject: { id: string; name: string; color: string | null; icon: string | null } | null;
  topic: { id: string; title: string } | null;
}

interface Props {
  subjects: StudySubject[];
  stats: StudyStats;
  sessions: StudySession[];
}

export function StudyPageClient({ subjects, stats, sessions }: Props) {
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showQuickSession, setShowQuickSession] = useState(false);
  const [editingSubject, setEditingSubject] = useState<StudySubject | null>(null);

  const activeSubjects = subjects.filter((s) => s.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estudio</h1>
          <p className="text-muted-foreground text-[15px]">
            Organiza tus materias y sesiones de estudio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQuickSession(true)}
            className="gap-2"
          >
            <Play className="size-4" />
            <span className="hidden sm:inline">Estudiar Ahora</span>
          </Button>
          <Button onClick={() => setShowSubjectForm(true)} className="gap-2">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nueva Materia</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubjects}</p>
                <p className="text-xs text-muted-foreground">Materias activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Clock className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.weekHours}</p>
                <p className="text-xs text-muted-foreground">Horas esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                <Timer className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.weekPomodoros}</p>
                <p className="text-xs text-muted-foreground">Pomodoros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <GraduationCap className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.weekSessions}</p>
                <p className="text-xs text-muted-foreground">Sesiones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams */}
      {stats.upcomingExams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold">Examenes proximamente</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.upcomingExams.map((exam) => (
              <Card key={exam.id} className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium truncate">{exam.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: exam.subjectColor || "#6b7280" }}
                        />
                        <span className="text-xs text-muted-foreground">{exam.subjectName}</span>
                      </div>
                    </div>
                    <Badge
                      variant={exam.daysLeft <= 3 ? "destructive" : exam.daysLeft <= 7 ? "warning" : "secondary"}
                    >
                      {exam.daysLeft === 0 ? "Hoy" : exam.daysLeft === 1 ? "Manana" : `en ${exam.daysLeft} dias`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subject Grid */}
      {activeSubjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={() => {
                setEditingSubject(subject);
                setShowSubjectForm(true);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Sin materias"
          description="Crea tu primera materia para comenzar a organizar tu estudio."
          actionLabel="Nueva Materia"
          onAction={() => setShowSubjectForm(true)}
        />
      )}

      {/* Subject Form Dialog */}
      <SubjectForm
        open={showSubjectForm}
        onOpenChange={(open) => {
          setShowSubjectForm(open);
          if (!open) setEditingSubject(null);
        }}
        subject={editingSubject}
      />

      {/* Quick Session Dialog */}
      <QuickSessionDialog
        open={showQuickSession}
        onOpenChange={setShowQuickSession}
        subjects={activeSubjects}
      />
    </div>
  );
}
