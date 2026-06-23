"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  Play,
  X,
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

// ---------------------------------------------------------------------------
// Lesson type icon
// ---------------------------------------------------------------------------

function LessonTypeIcon({ type }: { type: DisplayLesson["type"] }) {
  if (type === "video") return <Play className="size-3.5" />;
  if (type === "quiz") return <CheckCircle2 className="size-3.5" />;
  return <FileText className="size-3.5" />;
}

function LessonTypeBadge({ type }: { type: DisplayLesson["type"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
      <LessonTypeIcon type={type} />
      {getLessonTypeLabel(type)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lesson tools (notes persisted in localStorage)
// ---------------------------------------------------------------------------

const getNotesKey = (lessonId: string | number) =>
  `otto-learn-notes-${lessonId}`;

function LessonTools({ lessonId }: { lessonId: string | number }) {
  const [notes, setNotes] = React.useState("");
  const [hasLoaded, setHasLoaded] = React.useState(false);

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
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Lesson tools</h3>
        <div className="mt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <MessageSquare className="size-4" />
          Notes
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Add a note..."
        rows={6}
        className="w-full resize-y border-0 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson type renderers
// ---------------------------------------------------------------------------

function VideoLesson({ lesson }: { lesson: DisplayLesson }) {
  const embedUrl = lesson.url ? getYouTubeEmbedUrl(lesson.url) : null;

  return (
    <div className="space-y-5">
      {embedUrl ? (
        <div className="overflow-hidden rounded-lg border bg-black shadow-sm">
          <iframe
            src={embedUrl}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : lesson.url ? (
        <div className="overflow-hidden rounded-lg border bg-black shadow-sm">
          <iframe
            src={lesson.url}
            className="aspect-video w-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
          <Play className="mb-4 size-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No video available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This lesson does not have a video URL configured.
          </p>
        </div>
      )}

      {lesson.content && lesson.content !== lesson.url && (
        <div className="mx-auto w-full max-w-4xl">
          <div className="rounded-lg border bg-card p-6 shadow-sm md:p-8">
            <MarkdownPreview content={lesson.content} />
          </div>
        </div>
      )}

      <LessonTools lessonId={lesson.id} />
    </div>
  );
}

function TextLesson({ lesson }: { lesson: DisplayLesson }) {
  if (!lesson.content) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <FileText className="mb-4 size-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No reading content yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This lesson does not have any content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-lg border bg-card p-6 shadow-sm md:p-8">
          <MarkdownPreview content={lesson.content} />
        </div>
      </div>
      <LessonTools lessonId={lesson.id} />
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

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <CheckCircle2 className="mb-4 size-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">No questions yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This quiz does not have any questions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4" />
          <span>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {questions.map((question, index) => (
        <div
          key={question.id ?? index}
          className="rounded-xl border bg-card p-5"
        >
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Question {index + 1}
          </div>
          <h4 className="mb-4 text-base font-medium">
            {question.question || "Untitled question"}
          </h4>

          {question.options && question.options.length > 0 && (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3 bg-background text-foreground"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs text-muted-foreground">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="text-sm">
                    {option || `Option ${optionIndex + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {question.hint && (
            <div className="mt-4 rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
              Hint: {question.hint}
            </div>
          )}
        </div>
      ))}

      <LessonTools lessonId={lesson.id} />
    </div>
  );
}

function LessonContent({ lesson }: { lesson: DisplayLesson }) {
  return (
    <div className="min-h-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <LessonTypeBadge type={lesson.type} />
        {lesson.duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {lesson.duration}
          </span>
        )}
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{lesson.title}</h2>

      <div className="mt-5">
        {lesson.type === "video" && <VideoLesson lesson={lesson} />}
        {lesson.type === "text" && <TextLesson lesson={lesson} />}
        {lesson.type === "quiz" && <QuizLesson lesson={lesson} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Course lessons sidebar
// ---------------------------------------------------------------------------

function CourseLessonsSidebar({
  modules,
  activeLessonId,
  onLessonSelect,
}: {
  modules: DisplayModule[];
  activeLessonId: string | number | null;
  onLessonSelect: (lessonId: string | number) => void;
}) {
  const lessonCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  return (
    <aside className="flex min-h-0 flex-col border-l bg-card">
      <div className="shrink-0 border-b px-4 py-3">
        <h3 className="text-sm font-medium">Course content</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {modules.length} modules &bull; {lessonCount} lessons
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {modules.map((module, moduleIndex) => (
          <section key={module.id} className="border-b">
            <div className="bg-muted/50 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Module {moduleIndex + 1}
              </div>
              <h4 className="mt-1 text-sm font-medium">{module.title}</h4>
            </div>

            <div>
              {module.lessons.map((lesson, lessonIndex) => {
                const isActive =
                  String(lesson.id) === String(activeLessonId);

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onLessonSelect(lesson.id)}
                    className={`flex w-full gap-3 border-t px-4 py-3 text-left transition-all ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] text-muted-foreground">
                      {lessonIndex + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {lesson.title}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <LessonTypeIcon type={lesson.type} />
                        <span>{getLessonTypeLabel(lesson.type)}</span>
                        {lesson.duration && <span>{lesson.duration}</span>}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function LearnCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [course, setCourse] = React.useState<DisplayCourse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h1 className="text-xl font-medium">Loading course...</h1>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
          <h1 className="text-xl font-medium">Course not found</h1>
          <p className="mt-2 text-muted-foreground">
            This course may have been deleted or moved.
          </p>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4 bg-background">
        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${params.id}`)}
          size="sm"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Course
        </Button>

        <div className="flex-1 min-w-0">
          <h2 className="truncate text-sm font-medium text-right">
            {course.title}
          </h2>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${params.id}`)}
          size="sm"
        >
          <X className="mr-1 size-4" />
          <span className="text-sm">Exit</span>
        </Button>
      </div>

      {/* Main content */}
      <main className="min-h-0 flex-1 overflow-hidden">
        {activeLesson ? (
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex min-h-0 flex-col overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
              <LessonContent lesson={activeLesson} />

              {/* Previous / Next navigation */}
              <div className="mt-8 flex items-center justify-between border-t pt-6">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => handleLessonSelect(prevLesson.id)}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:inline">{prevLesson.title}</span>
                    <span className="sm:hidden">Previous</span>
                  </Button>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <Button
                    onClick={() => handleLessonSelect(nextLesson.id)}
                    className="gap-1"
                  >
                    <span className="hidden sm:inline">{nextLesson.title}</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            </div>
            <CourseLessonsSidebar
              modules={course.modules}
              activeLessonId={activeLessonId}
              onLessonSelect={handleLessonSelect}
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <BookOpen className="mb-4 size-16 text-muted-foreground" />
            <h2 className="text-xl font-medium">No lessons yet</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              This course doesn&apos;t have any lessons available yet.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
