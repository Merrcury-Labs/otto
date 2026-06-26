"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  Play,
  Sparkles,
  X,
  Download,
  ExternalLink,
  StickyNote,
  Bookmark,
  Share2,
  MoreHorizontal,
  PanelRightOpen,
  PanelRightClose,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { graphqlFetch } from "@/lib/graphql/client";
import { courseDetailQuery } from "@/lib/graphql/courses";
import {
  type BackendCourse,
  type DisplayCourse,
  type DisplayLesson,
  type DisplayModule,
  normalizeCourse,
  flattenLessons,
  getAdjacentLessons,
  getLessonTypeLabel,
  getYouTubeEmbedUrl,
} from "@/lib/graphql/normalize";
import { MarkdownPreview } from "@/components/MarkdownPreview";
import { AITutorPanel } from "@/components/ai-tutor-panel";
import { ProgressRing, ProgressBar } from "@/components/learning-progress";

// ─── Lesson type icon ──────────────────────────────────────────────────

function LessonTypeIcon({
  type,
  className = "size-3.5",
}: {
  type: DisplayLesson["type"];
  className?: string;
}) {
  if (type === "video") return <Play className={className} />;
  if (type === "quiz") return <CheckCircle2 className={className} />;
  return <FileText className={className} />;
}

function LessonTypeBadge({ type }: { type: DisplayLesson["type"] }) {
  const colorMap = {
    video: "text-blue-600 bg-blue-500/8 dark:text-blue-400 dark:bg-blue-500/10",
    quiz: "text-amber-600 bg-amber-500/8 dark:text-amber-400 dark:bg-amber-500/10",
    text: "text-emerald-600 bg-emerald-500/8 dark:text-emerald-400 dark:bg-emerald-500/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${colorMap[type]}`}
    >
      <LessonTypeIcon type={type} className="size-3" />
      {getLessonTypeLabel(type)}
    </span>
  );
}

// ─── Lesson tools (notes persisted in localStorage) ────────────────────

const getNotesKey = (lessonId: string | number) =>
  `otto-learn-notes-${lessonId}`;

function LessonTools({ lessonId }: { lessonId: string | number }) {
  const [notes, setNotes] = React.useState("");
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(getNotesKey(lessonId));
      if (saved !== null) setNotes(saved);
    } catch {
      // localStorage unavailable
    }
    setHasLoaded(true);
  }, [lessonId]);

  const handleChange = (value: string) => {
    setNotes(value);
    try {
      localStorage.setItem(getNotesKey(lessonId), value);
    } catch {
      // localStorage unavailable
    }
  };

  if (!hasLoaded) return null;

  return (
    <div className="rounded-xl border bg-card overflow-hidden transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-6 items-center justify-center rounded-md bg-amber-500/10">
            <StickyNote className="size-3 text-amber-600" />
          </div>
          <div className="text-left">
            <span className="text-[13px] font-medium">Study Notes</span>
            {notes && (
              <span className="ml-2 text-[11px] text-muted-foreground">
                {notes.length} chars
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && (
        <div className="border-t">
          <textarea
            value={notes}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Jot down key takeaways, questions, or summaries…"
            rows={8}
            className="w-full resize-y border-0 bg-transparent px-4 py-3 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

// ─── Resource links section ────────────────────────────────────────────

function ResourceLinks() {
  const resources = [
    { label: "Course Slides", icon: Download },
    { label: "Documentation", icon: ExternalLink },
  ];

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="size-3.5 text-muted-foreground" />
          <span className="text-[13px] font-medium">Resources</span>
        </div>
      </div>
      <div className="p-2">
        {resources.map((resource, i) => (
          <button
            key={i}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            <resource.icon className="size-3.5" />
            {resource.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Lesson type renderers ─────────────────────────────────────────────

function VideoLesson({ lesson }: { lesson: DisplayLesson }) {
  const embedUrl = lesson.url ? getYouTubeEmbedUrl(lesson.url) : null;

  return (
    <div className="space-y-6">
      {embedUrl ? (
        <div className="overflow-hidden rounded-xl border bg-black shadow-elevation-1">
          <iframe
            src={embedUrl}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : lesson.url ? (
        <div className="overflow-hidden rounded-xl border bg-black shadow-elevation-1">
          <iframe
            src={lesson.url}
            className="aspect-video w-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
            <Play className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            No video available
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This lesson does not have a video URL configured.
          </p>
        </div>
      )}

      {lesson.content && lesson.content !== lesson.url && (
        <div className="prose-container rounded-xl border bg-card p-6 shadow-elevation-1 md:p-8 lg:p-10">
          <MarkdownPreview content={lesson.content} />
        </div>
      )}

      <LessonTools lessonId={lesson.id} />
      <ResourceLinks />
    </div>
  );
}

function TextLesson({ lesson }: { lesson: DisplayLesson }) {
  if (!lesson.content) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
          <FileText className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          No reading content yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This lesson does not have any content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="prose-container rounded-xl border bg-card p-6 shadow-elevation-1 md:p-8 lg:p-10">
        <MarkdownPreview content={lesson.content} />
      </div>
      <LessonTools lessonId={lesson.id} />
      <ResourceLinks />
    </div>
  );
}

function QuizLesson({ lesson }: { lesson: DisplayLesson }) {
  // Parse quiz questions from content JSON
  let questions: Array<{
    id: number;
    question: string;
    options: string[];
    hint?: string;
  }> = [];

  if (lesson.content) {
    try {
      const parsed = JSON.parse(lesson.content);
      if (Array.isArray(parsed)) questions = parsed;
    } catch {
      // not JSON, ignore
    }
  }

  // Interactive quiz state
  const [selectedAnswers, setSelectedAnswers] = React.useState<
    Record<number, number>
  >({});
  const [revealedHints, setRevealedHints] = React.useState<
    Set<number>
  >(new Set());
  const [submitted, setSubmitted] = React.useState(false);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4">
          <CheckCircle2 className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          No questions yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This quiz does not have any questions.
        </p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.filter((q, i) => {
    // For demo: first option is always correct (in a real app, this would come from the backend)
    return selectedAnswers[i] === 0;
  }).length;

  return (
    <div className="space-y-4">
      {/* Quiz header */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
            <CheckCircle2 className="size-4.5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold tracking-tight">
              Knowledge Check
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} • Test
              your understanding
            </p>
          </div>
        </div>
        {submitted && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[18px] font-bold tracking-tight">
                {correctCount}/{totalQuestions}
              </p>
              <p className="text-[11px] text-muted-foreground">Score</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      {!submitted && (
        <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-3">
          <div className="flex-1">
            <ProgressBar
              progress={
                totalQuestions > 0
                  ? Math.round((answeredCount / totalQuestions) * 100)
                  : 0
              }
              showPercentage={false}
            />
          </div>
          <span className="text-[12px] font-medium text-muted-foreground shrink-0">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
      )}

      {/* Questions */}
      {questions.map((question, index) => {
        const isSelected = selectedAnswers[index] !== undefined;
        const selectedOption = selectedAnswers[index];

        return (
          <div
            key={question.id ?? index}
            className={`rounded-xl border bg-card p-5 transition-all ${
              submitted && selectedOption === 0
                ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                : submitted && selectedOption !== 0 && isSelected
                ? "border-red-500/30 bg-red-500/[0.02]"
                : ""
            }`}
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-secondary text-[11px] font-bold text-muted-foreground">
                {index + 1}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Question {index + 1}
              </span>
            </div>
            <h4 className="mb-5 text-[15px] font-semibold leading-snug tracking-tight">
              {question.question || "Untitled question"}
            </h4>

            {question.options && question.options.length > 0 && (
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelectedOption =
                    selectedAnswers[index] === optionIndex;
                  const isCorrect = submitted && optionIndex === 0;
                  const isWrong =
                    submitted && isSelectedOption && optionIndex !== 0;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => {
                        if (submitted) return;
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [index]: optionIndex,
                        }));
                      }}
                      disabled={submitted}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                        isSelectedOption && !submitted
                          ? "border-primary bg-primary/5 text-foreground"
                          : isCorrect
                          ? "border-emerald-500/40 bg-emerald-500/5 text-foreground"
                          : isWrong
                          ? "border-red-500/40 bg-red-500/5 text-foreground line-through opacity-60"
                          : submitted
                          ? "border-transparent bg-secondary/30 text-muted-foreground"
                          : "border-transparent bg-secondary/30 hover:bg-secondary/60 text-foreground"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                          isSelectedOption && !submitted
                            ? "bg-primary text-primary-foreground"
                            : isCorrect
                            ? "bg-emerald-500 text-white"
                            : isWrong
                            ? "bg-red-500 text-white"
                            : "bg-background text-muted-foreground border"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : isWrong ? (
                          <X className="size-3.5" />
                        ) : (
                          String.fromCharCode(65 + optionIndex)
                        )}
                      </span>
                      <span className="text-[13px] font-medium">
                        {option || `Option ${optionIndex + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {question.hint && (
              <div className="mt-4">
                {revealedHints.has(index) ? (
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
                    <span className="font-semibold">Hint:</span>{" "}
                    {question.hint}
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setRevealedHints((prev) => new Set([...prev, index]))
                    }
                    className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    💡 Show hint
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      {!submitted && answeredCount === totalQuestions && (
        <Button
          onClick={() => setSubmitted(true)}
          className="w-full h-11 text-[14px] font-semibold rounded-xl"
        >
          Check Answers
        </Button>
      )}

      {submitted && (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setSubmitted(false);
              setSelectedAnswers({});
              setRevealedHints(new Set());
            }}
            variant="outline"
            className="flex-1 h-11 rounded-xl"
          >
            Retake Quiz
          </Button>
          <Button className="flex-1 h-11 rounded-xl">
            Continue Learning
          </Button>
        </div>
      )}

      <LessonTools lessonId={lesson.id} />
    </div>
  );
}

function LessonContent({ lesson }: { lesson: DisplayLesson }) {
  return (
    <div className="min-h-full animate-in fade-in duration-300">
      {/* Lesson header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <LessonTypeBadge type={lesson.type} />
          {lesson.duration && (
            <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
              <Clock className="size-3" />
              {lesson.duration}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight leading-snug md:text-3xl">
          {lesson.title}
        </h1>
      </div>

      <div className="mt-6">
        {lesson.type === "video" && <VideoLesson lesson={lesson} />}
        {lesson.type === "text" && <TextLesson lesson={lesson} />}
        {lesson.type === "quiz" && <QuizLesson lesson={lesson} />}
      </div>
    </div>
  );
}

// ─── Curriculum Sidebar (Notion-style) ─────────────────────────────────

function CurriculumSidebar({
  modules,
  activeLessonId,
  onLessonSelect,
  courseTitle,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: {
  modules: DisplayModule[];
  activeLessonId: string | number | null;
  onLessonSelect: (lessonId: string | number) => void;
  courseTitle: string;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(
    () => new Set(modules.map((m) => String(m.id)))
  );

  const lessonCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Find which module contains the active lesson and ensure it's expanded
  React.useEffect(() => {
    for (const module of modules) {
      const hasActiveLesson = module.lessons.some(
        (l) => String(l.id) === String(activeLessonId)
      );
      if (hasActiveLesson) {
        setExpandedModules((prev) => new Set([...prev, String(module.id)]));
      }
    }
  }, [activeLessonId, modules]);

  if (isCollapsed) {
    return (
      <div className="flex w-12 shrink-0 flex-col items-center border-r bg-card py-4 gap-2">
        <button
          onClick={onToggleCollapse}
          className="flex size-8 items-center justify-center rounded-md hover:bg-secondary transition-colors"
          title="Expand sidebar"
        >
          <PanelRightOpen className="size-4 text-muted-foreground" />
        </button>
        <div className="mt-4 flex flex-col items-center gap-1.5">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => toggleModule(String(module.id))}
              className="flex size-2 rounded-full bg-muted-foreground/30 hover:bg-foreground transition-colors"
              title={module.title}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <aside className="flex min-h-0 w-[280px] shrink-0 flex-col border-r bg-card">
      {/* Sidebar header */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="size-4 text-primary shrink-0" />
            <h3 className="text-[13px] font-semibold tracking-tight truncate">
              {courseTitle}
            </h3>
          </div>
          <button
            onClick={onToggleCollapse}
            className="flex size-6 items-center justify-center rounded-md hover:bg-secondary transition-colors shrink-0"
            title="Collapse sidebar"
          >
            <PanelRightClose className="size-3.5 text-muted-foreground" />
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {modules.length} modules &bull; {lessonCount} lessons
        </p>
        {/* Progress bar */}
        <div className="mt-3">
          <ProgressBar progress={0} showPercentage={false} animated={false} />
        </div>
      </div>

      {/* Module list */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-warm">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(String(module.id));
          const hasActiveLesson = module.lessons.some(
            (l) => String(l.id) === String(activeLessonId)
          );

          return (
            <div key={module.id} className="border-b last:border-b-0">
              {/* Module header */}
              <button
                onClick={() => toggleModule(String(module.id))}
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-secondary/50 ${
                  hasActiveLesson ? "bg-secondary/30" : ""
                }`}
              >
                <ChevronDown
                  className={`size-3.5 text-muted-foreground shrink-0 transition-transform ${
                    isExpanded ? "" : "-rotate-90"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Module {moduleIndex + 1}
                  </div>
                  <div className="text-[13px] font-medium truncate tracking-tight">
                    {module.title}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {module.lessons.length}
                </span>
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="pb-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isActive =
                      String(lesson.id) === String(activeLessonId);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onLessonSelect(lesson.id)}
                        className={`group flex w-full items-center gap-3 px-4 py-2 text-left transition-all ${
                          isActive
                            ? "bg-primary/5 text-foreground border-r-2 border-primary"
                            : "text-foreground/80 hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {/* Lesson indicator */}
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground group-hover:bg-secondary/80"
                          }`}
                        >
                          {lessonIndex + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-[13px] leading-snug ${
                              isActive
                                ? "font-semibold"
                                : "font-medium"
                            }`}
                          >
                            {lesson.title}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <LessonTypeIcon
                              type={lesson.type}
                              className="size-3"
                            />
                            <span>{getLessonTypeLabel(lesson.type)}</span>
                            {lesson.duration && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="size-2.5" />
                                {lesson.duration}
                              </span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────

export default function LearnCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [course, setCourse] = React.useState<DisplayCourse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAITutorOpen, setIsAITutorOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      try {
        const result = await graphqlFetch<{ courses: BackendCourse[] }>({
          query: courseDetailQuery,
          operationName: "CourseDetail",
        });

        if (!mounted) return;

        const backendCourse = result.courses.find(
          (item) => String(item.id) === String(params.id)
        );

        if (backendCourse) {
          setCourse(normalizeCourse(backendCourse));
        } else {
          setCourse(null);
        }
      } catch {
        if (mounted) setCourse(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    setIsLoading(true);
    loadCourse();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  // Determine active lesson from URL search params, or default to first lesson
  const lessonParam = searchParams.get("lesson");
  const allLessons = course ? flattenLessons(course.modules) : [];

  const activeLessonId: string | number | null = (() => {
    if (lessonParam) return lessonParam;
    const firstLesson = allLessons[0];
    return firstLesson?.id ?? null;
  })();

  const activeLesson =
    allLessons.find(
      (lesson) => String(lesson.id) === String(activeLessonId)
    ) ?? null;

  const { previous: prevLesson, next: nextLesson } = course
    ? getAdjacentLessons(course.modules, activeLessonId ?? "")
    : { previous: null, next: null };

  const handleLessonSelect = (lessonId: string | number) => {
    router.push(`/courses/${params.id}/learn?lesson=${lessonId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary animate-pulse-soft">
            <BookOpen className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading course…</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!course) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <BookOpen className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Course not found
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This course may have been deleted or moved.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      {/* Top bar — Minimal Linear-style */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-3 bg-background">
        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${params.id}`)}
          size="sm"
          className="gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <BookOpen className="size-3.5 text-primary shrink-0" />
          <h2 className="truncate text-[13px] font-medium text-muted-foreground">
            {course.title}
          </h2>
        </div>

        {/* Lesson counter */}
        {activeLesson && (
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>
              Lesson{" "}
              {allLessons.findIndex(
                (l) => String(l.id) === String(activeLessonId)
              ) + 1}{" "}
              of {allLessons.length}
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-border" />

        {/* AI Tutor toggle */}
        <Button
          variant={isAITutorOpen ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setIsAITutorOpen(!isAITutorOpen)}
          className={`gap-1.5 text-[13px] rounded-lg ${
            isAITutorOpen
              ? "bg-violet-500/10 text-violet-600 hover:bg-violet-500/15 hover:text-violet-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3.5" />
          <span className="hidden sm:inline">AI Tutor</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${params.id}`)}
          size="sm"
          className="gap-1 text-[13px] text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>

      {/* Main content area — 3-panel layout */}
      <main className="min-h-0 flex-1 overflow-hidden flex">
        {activeLesson ? (
          <>
            {/* Left: Curriculum sidebar */}
            <CurriculumSidebar
              modules={course.modules}
              activeLessonId={activeLessonId}
              onLessonSelect={handleLessonSelect}
              courseTitle={course.title}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
            />

            {/* Center: Lesson content */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-warm">
              <div className="mx-auto w-full max-w-5xl px-6 py-8 md:px-10 lg:px-14 lg:py-10">
                <LessonContent lesson={activeLesson} />

                {/* Previous / Next navigation */}
                <div className="mt-12 flex items-stretch gap-3 border-t pt-8">
                  {prevLesson ? (
                    <button
                      onClick={() => handleLessonSelect(prevLesson.id)}
                      className="group flex flex-1 items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-elevation-1"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                        <ChevronLeft className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Previous
                        </span>
                        <span className="block text-[13px] font-medium truncate group-hover:text-primary transition-colors">
                          {prevLesson.title}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}
                  {nextLesson ? (
                    <button
                      onClick={() => handleLessonSelect(nextLesson.id)}
                      className="group flex flex-1 items-center justify-end gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:shadow-elevation-1"
                    >
                      <div className="min-w-0 text-right">
                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Next
                        </span>
                        <span className="block text-[13px] font-medium truncate group-hover:text-primary transition-colors">
                          {nextLesson.title}
                        </span>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              </div>
            </div>

            {/* Right: AI Tutor panel */}
            <AITutorPanel
              isOpen={isAITutorOpen}
              onClose={() => setIsAITutorOpen(false)}
              lessonTitle={activeLesson?.title}
              courseTitle={course.title}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-secondary mb-4">
              <BookOpen className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              No lessons yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This course doesn&apos;t have any lessons available yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
