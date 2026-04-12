"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Star,
  Pencil,
  Trash2,
  Plus,
  Play,
  BookOpen,
  Clock,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  addTopic,
  updateTopic,
  deleteTopic,
  addScheduleBlock,
  deleteScheduleBlock,
  addExam,
  updateExam,
  deleteExam,
  deleteSubject,
  createSession,
  startSession,
} from "@/actions/study";
import { SubjectForm } from "./subject-form";
import { PomodoroTimer } from "./pomodoro-timer";
import { METHOD_CONFIG, type MethodKey } from "./quick-session-dialog";

const DAY_NAMES_FULL = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

interface Topic {
  id: string;
  title: string;
  description: string | null;
  estimatedHours: number | null;
  completedPercent: number;
  priority: number;
  status: string;
  position: number;
}

interface Session {
  id: string;
  method: string;
  status: string;
  pomodoroCompleted: number;
  actualDurationMin: number | null;
  focusScore: number | null;
  notes: string | null;
  createdAt: string;
  actualStart: string | null;
  actualEnd: string | null;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  priority: number;
  notes: string | null;
  status: string;
}

interface ScheduleBlock {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Subject {
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
  topics: Topic[];
  sessions: Session[];
  exams: Exam[];
  scheduleBlocks: ScheduleBlock[];
}

interface Props {
  subject: Subject;
}

export function SubjectDetailClient({ subject }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [now] = useState(() => Date.now());

  // Topic form
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicEstimatedHours, setTopicEstimatedHours] = useState("");
  const [topicPriority, setTopicPriority] = useState("0");

  // Schedule form
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedDay, setSchedDay] = useState("1");
  const [schedStart, setSchedStart] = useState("09:00");
  const [schedEnd, setSchedEnd] = useState("10:00");

  // Exam form
  const [showExamForm, setShowExamForm] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examPriority, setExamPriority] = useState("1");
  const [examNotes, setExamNotes] = useState("");

  // Session dialog
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionMethod, setSessionMethod] = useState<MethodKey>("pomodoro_25_5");
  const [sessionTopicId, setSessionTopicId] = useState("");
  const [sessionPomodoroTarget, setSessionPomodoroTarget] = useState("4");
  const [activeTimerSession, setActiveTimerSession] = useState<{
    id: string;
    method: string;
    pomodoroTarget: number | null;
  } | null>(null);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSubject(subject.id);
        toast.success("Materia eliminada");
        router.push("/study");
      } catch (err) {
        console.error("SubjectDetailClient.handleDelete:", err);
        toast.error("Error al eliminar");
      }
    });
  };

  const handleAddTopic = () => {
    if (!topicTitle.trim()) {
      toast.error("El titulo es requerido");
      return;
    }
    startTransition(async () => {
      try {
        await addTopic(subject.id, {
          title: topicTitle.trim(),
          description: topicDescription.trim(),
          estimatedHours: topicEstimatedHours ? parseFloat(topicEstimatedHours) : undefined,
          priority: parseInt(topicPriority),
        });
        toast.success("Tema agregado");
        setShowTopicForm(false);
        setTopicTitle("");
        setTopicDescription("");
        setTopicEstimatedHours("");
        setTopicPriority("0");
      } catch (err) {
        console.error("SubjectDetailClient.handleAddTopic:", err);
        toast.error("Error al agregar tema");
      }
    });
  };

  const handleToggleTopicComplete = (topic: Topic) => {
    startTransition(async () => {
      try {
        const newPercent = topic.completedPercent >= 100 ? 0 : 100;
        const newStatus = newPercent >= 100 ? "completed" : "in_progress";
        await updateTopic(topic.id, { completedPercent: newPercent, status: newStatus });
      } catch (err) {
        console.error("SubjectDetailClient.handleToggleTopicComplete:", err);
        toast.error("Error al actualizar tema");
      }
    });
  };

  const handleDeleteTopic = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTopic(id);
        toast.success("Tema eliminado");
      } catch (err) {
        console.error("SubjectDetailClient.handleDeleteTopic:", err);
        toast.error("Error al eliminar tema");
      }
    });
  };

  const handleAddSchedule = () => {
    startTransition(async () => {
      try {
        await addScheduleBlock({
          subjectId: subject.id,
          dayOfWeek: parseInt(schedDay),
          startTime: schedStart,
          endTime: schedEnd,
        });
        toast.success("Horario agregado");
        setShowScheduleForm(false);
      } catch (err) {
        console.error("SubjectDetailClient.handleAddSchedule:", err);
        toast.error("Error al agregar horario");
      }
    });
  };

  const handleDeleteSchedule = (id: string) => {
    startTransition(async () => {
      try {
        await deleteScheduleBlock(id);
        toast.success("Horario eliminado");
      } catch (err) {
        console.error("SubjectDetailClient.handleDeleteSchedule:", err);
        toast.error("Error al eliminar horario");
      }
    });
  };

  const handleAddExam = () => {
    if (!examTitle.trim() || !examDate) {
      toast.error("Titulo y fecha son requeridos");
      return;
    }
    startTransition(async () => {
      try {
        await addExam({
          subjectId: subject.id,
          title: examTitle.trim(),
          date: examDate,
          priority: parseInt(examPriority),
          notes: examNotes.trim(),
        });
        toast.success("Examen agregado");
        setShowExamForm(false);
        setExamTitle("");
        setExamDate("");
        setExamPriority("1");
        setExamNotes("");
      } catch (err) {
        console.error("SubjectDetailClient.handleAddExam:", err);
        toast.error("Error al agregar examen");
      }
    });
  };

  const handleDeleteExam = (id: string) => {
    startTransition(async () => {
      try {
        await deleteExam(id);
        toast.success("Examen eliminado");
      } catch (err) {
        console.error("SubjectDetailClient.handleDeleteExam:", err);
        toast.error("Error al eliminar examen");
      }
    });
  };

  const handleToggleExamStatus = (exam: Exam) => {
    const nextStatus = exam.status === "done" ? "pending" : "done";
    startTransition(async () => {
      try {
        await updateExam(exam.id, { status: nextStatus });
      } catch (err) {
        console.error("SubjectDetailClient.handleToggleExamStatus:", err);
        toast.error("Error al actualizar examen");
      }
    });
  };

  const handleStartStudy = () => {
    setShowSessionDialog(true);
  };

  const handleCreateAndStartSession = () => {
    startTransition(async () => {
      try {
        const session = await createSession({
          subjectId: subject.id,
          topicId: sessionTopicId || undefined,
          method: sessionMethod,
          pomodoroTarget: sessionMethod !== "free" ? parseInt(sessionPomodoroTarget) || 4 : undefined,
        });
        await startSession(session.id);
        setShowSessionDialog(false);
        setActiveTimerSession({
          id: session.id,
          method: sessionMethod,
          pomodoroTarget: sessionMethod !== "free" ? parseInt(sessionPomodoroTarget) || 4 : null,
        });
      } catch (err) {
        console.error("SubjectDetailClient.handleCreateAndStartSession:", err);
        toast.error("Error al iniciar sesion");
      }
    });
  };

  // Active timer overlay
  if (activeTimerSession) {
    return (
      <PomodoroTimer
        session={activeTimerSession}
        subjectName={subject.name}
        topicName={subject.topics.find((t) => t.id === sessionTopicId)?.title}
        onComplete={() => {
          setActiveTimerSession(null);
          router.refresh();
        }}
        onCancel={() => setActiveTimerSession(null)}
      />
    );
  }

  const completedTopics = subject.topics.filter((t) => t.completedPercent >= 100).length;
  const topicProgress = subject.topics.length > 0 ? Math.round((completedTopics / subject.topics.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/study")}
          className="mt-0.5"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{subject.icon || "📚"}</span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight truncate">{subject.name}</h1>
              {subject.difficulty && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
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
          {subject.teacher && (
            <p className="text-sm text-muted-foreground mt-1 ml-12">
              Profesor: {subject.teacher}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowEditForm(true)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Study Button */}
      <Button size="lg" onClick={handleStartStudy} className="w-full gap-2 rounded-2xl h-12">
        <Play className="size-5" />
        Estudiar esta materia
      </Button>

      {/* Topic Progress */}
      {subject.topics.length > 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso de temas</span>
              <span className="text-sm text-muted-foreground">
                {completedTopics}/{subject.topics.length} completados
              </span>
            </div>
            <Progress value={topicProgress} />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="temas">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="temas">Temas</TabsTrigger>
          <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="examenes">Examenes</TabsTrigger>
        </TabsList>

        {/* TEMAS TAB */}
        <TabsContent value="temas" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Temas ({subject.topics.length})</h3>
            <Button size="sm" onClick={() => setShowTopicForm(true)} className="gap-1.5">
              <Plus className="size-3.5" />
              Agregar
            </Button>
          </div>

          {subject.topics.length > 0 ? (
            <div className="space-y-2">
              {subject.topics.map((topic) => (
                <Card key={topic.id} className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTopicComplete(topic)}
                        className="mt-0.5 shrink-0"
                        disabled={isPending}
                      >
                        <CheckCircle2
                          className={`size-5 transition-colors ${
                            topic.completedPercent >= 100
                              ? "text-emerald-500 fill-emerald-500"
                              : "text-muted-foreground/40 hover:text-muted-foreground"
                          }`}
                        />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-[15px] font-medium ${
                              topic.completedPercent >= 100 ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {topic.title}
                          </p>
                          {topic.priority > 0 && (
                            <Badge
                              variant={topic.priority === 2 ? "destructive" : "warning"}
                              className="text-[10px] px-1.5"
                            >
                              {topic.priority === 2 ? "Alta" : "Media"}
                            </Badge>
                          )}
                        </div>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
                        )}
                        {topic.completedPercent > 0 && topic.completedPercent < 100 && (
                          <div className="mt-2">
                            <Progress value={topic.completedPercent} className="h-1.5" />
                            <span className="text-[10px] text-muted-foreground">{topic.completedPercent}%</span>
                          </div>
                        )}
                        {topic.estimatedHours && (
                          <span className="text-[10px] text-muted-foreground">
                            ~{topic.estimatedHours}h estimadas
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteTopic(topic.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Sin temas"
              description="Agrega temas para organizar tu estudio."
              actionLabel="Agregar Tema"
              onAction={() => setShowTopicForm(true)}
            />
          )}
        </TabsContent>

        {/* SESIONES TAB */}
        <TabsContent value="sesiones" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Sesiones recientes</h3>
            <Button size="sm" onClick={handleStartStudy} className="gap-1.5">
              <Play className="size-3.5" />
              Nueva Sesion
            </Button>
          </div>

          {subject.sessions.length > 0 ? (
            <div className="space-y-2">
              {subject.sessions.map((session) => {
                const methodConfig = METHOD_CONFIG[session.method as MethodKey];
                return (
                  <Card key={session.id} className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{methodConfig?.icon || "⏱️"}</span>
                          <div>
                            <p className="text-[15px] font-medium">
                              {methodConfig?.label || session.method}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.createdAt).toLocaleDateString("es", {
                                day: "numeric",
                                month: "short",
                              })}
                              {session.actualDurationMin && ` · ${session.actualDurationMin} min`}
                              {session.pomodoroCompleted > 0 && ` · ${session.pomodoroCompleted} 🍅`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.focusScore && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: session.focusScore }).map((_, i) => (
                                <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          )}
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "success"
                                : session.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {session.status === "completed"
                              ? "Completada"
                              : session.status === "active"
                              ? "Activa"
                              : "Planificada"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="Sin sesiones"
              description="Inicia tu primera sesion de estudio para esta materia."
              actionLabel="Estudiar"
              onAction={handleStartStudy}
            />
          )}
        </TabsContent>

        {/* HORARIOS TAB */}
        <TabsContent value="horarios" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Horarios semanales</h3>
            <Button size="sm" onClick={() => setShowScheduleForm(true)} className="gap-1.5">
              <Plus className="size-3.5" />
              Agregar
            </Button>
          </div>

          {subject.scheduleBlocks.length > 0 ? (
            <div className="grid gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const blocks = subject.scheduleBlocks.filter((b) => b.dayOfWeek === day);
                if (blocks.length === 0) return null;
                return (
                  <Card key={day} className="rounded-2xl">
                    <CardContent className="p-4">
                      <p className="text-sm font-medium mb-2">{DAY_NAMES_FULL[day]}</p>
                      <div className="space-y-1.5">
                        {blocks.map((block) => (
                          <div key={block.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="size-3.5 text-muted-foreground" />
                              <span className="text-[15px]">
                                {block.startTime} - {block.endTime}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteSchedule(block.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="size-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Sin horarios"
              description="Agrega bloques de horario para organizar tu semana de estudio."
              actionLabel="Agregar Horario"
              onAction={() => setShowScheduleForm(true)}
            />
          )}
        </TabsContent>

        {/* EXAMENES TAB */}
        <TabsContent value="examenes" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Examenes</h3>
            <Button size="sm" onClick={() => setShowExamForm(true)} className="gap-1.5">
              <Plus className="size-3.5" />
              Agregar
            </Button>
          </div>

          {subject.exams.length > 0 ? (
            <div className="space-y-2">
              {subject.exams.map((exam) => {
                const examDateObj = new Date(exam.date);
                const daysLeft = Math.max(
                  0,
                  Math.ceil((examDateObj.getTime() - now) / 86400000)
                );
                const isPast = examDateObj.getTime() < now;

                return (
                  <Card key={exam.id} className="rounded-2xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleExamStatus(exam)}
                            className="mt-0.5"
                            disabled={isPending}
                          >
                            <CheckCircle2
                              className={`size-5 transition-colors ${
                                exam.status === "done"
                                  ? "text-emerald-500 fill-emerald-500"
                                  : "text-muted-foreground/40 hover:text-muted-foreground"
                              }`}
                            />
                          </button>
                          <div>
                            <p
                              className={`text-[15px] font-medium ${
                                exam.status === "done" ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {exam.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {examDateObj.toLocaleDateString("es", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            {exam.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5">{exam.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isPast && exam.status !== "done" && (
                            <Badge
                              variant={
                                daysLeft <= 3 ? "destructive" : daysLeft <= 7 ? "warning" : "secondary"
                              }
                            >
                              {daysLeft === 0
                                ? "Hoy"
                                : daysLeft === 1
                                ? "Manana"
                                : `en ${daysLeft} dias`}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteExam(exam.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="size-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Sin examenes"
              description="Agrega examenes para hacer seguimiento de tus fechas importantes."
              actionLabel="Agregar Examen"
              onAction={() => setShowExamForm(true)}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Subject Dialog */}
      <SubjectForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        subject={subject}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Materia</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Se eliminara la materia &quot;{subject.name}&quot; con todos sus temas, sesiones, horarios y
            examenes. Esta accion no se puede deshacer.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={showTopicForm} onOpenChange={setShowTopicForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Tema</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Titulo</Label>
              <Input
                placeholder="Nombre del tema"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripcion (opcional)</Label>
              <Textarea
                placeholder="Descripcion..."
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                className="min-h-15"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Horas estimadas</Label>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  step={0.5}
                  value={topicEstimatedHours}
                  onChange={(e) => setTopicEstimatedHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <NativeSelect value={topicPriority} onChange={(e) => setTopicPriority(e.target.value)}>
                  <option value="0">Baja</option>
                  <option value="1">Media</option>
                  <option value="2">Alta</option>
                </NativeSelect>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopicForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTopic} disabled={isPending}>
              {isPending ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Schedule Dialog */}
      <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Horario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Dia</Label>
              <NativeSelect value={schedDay} onChange={(e) => setSchedDay(e.target.value)}>
                {DAY_NAMES_FULL.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Inicio</Label>
                <Input
                  type="time"
                  value={schedStart}
                  onChange={(e) => setSchedStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Input
                  type="time"
                  value={schedEnd}
                  onChange={(e) => setSchedEnd(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSchedule} disabled={isPending}>
              {isPending ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Exam Dialog */}
      <Dialog open={showExamForm} onOpenChange={setShowExamForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Examen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Titulo</Label>
              <Input
                placeholder="Nombre del examen"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <NativeSelect value={examPriority} onChange={(e) => setExamPriority(e.target.value)}>
                  <option value="0">Baja</option>
                  <option value="1">Media</option>
                  <option value="2">Alta</option>
                </NativeSelect>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                placeholder="Notas sobre el examen..."
                value={examNotes}
                onChange={(e) => setExamNotes(e.target.value)}
                className="min-h-15"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExam} disabled={isPending}>
              {isPending ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Sesion de Estudio</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {subject.topics.length > 0 && (
              <div className="space-y-2">
                <Label>Tema (opcional)</Label>
                <NativeSelect
                  value={sessionTopicId}
                  onChange={(e) => setSessionTopicId(e.target.value)}
                >
                  <option value="">Sin tema especifico</option>
                  {subject.topics
                    .filter((t) => t.status !== "completed")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </NativeSelect>
              </div>
            )}

            <div className="space-y-2">
              <Label>Metodo</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(METHOD_CONFIG) as MethodKey[]).map((key) => {
                  const config = METHOD_CONFIG[key];
                  const isSelected = sessionMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSessionMethod(key)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xl">{config.icon}</span>
                      <span className="text-[13px] font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {sessionMethod !== "free" && (
              <div className="space-y-2">
                <Label>Rondas objetivo</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={sessionPomodoroTarget}
                  onChange={(e) => setSessionPomodoroTarget(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAndStartSession} disabled={isPending} className="gap-2">
              <Play className="size-4" />
              {isPending ? "Iniciando..." : "Empezar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
