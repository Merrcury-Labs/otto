"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Code,
  FileText,
  Play,
  X,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import type { CourseFormData, CourseModule, Lesson } from "../../types";
import {
  type AdminCoursesData,
  flattenLessons,
  getCourseFormData,
  getLessonTypeLabel,
} from "../../utils";
import { graphqlFetch } from "../../../../lib/graphql/client";
import { adminCoursesQuery } from "../../../../lib/graphql/courses";
import { LessonContent } from "./components/LessonContent";

function LessonTypeIcon({ type }: { type: Lesson["type"] }) {
  if (type === "video") return <Play className="h-3.5 w-3.5" />;
  if (type === "quiz") return <Check className="h-3.5 w-3.5" />;
  if (type === "code") return <Code className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

function CourseLessonsSidebar({
  modules,
  activeLessonId,
  onLessonSelect,
}: {
  modules: CourseModule[];
  activeLessonId: string | number | null;
  onLessonSelect: (lessonId: string | number) => void;
}) {
  const lessonCount = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );

  return (
    <aside className="flex min-h-0 flex-col border-l border-border/10 bg-card">
      <div className="shrink-0 border-b border-border/10 px-4 py-3">
        <h3 className="text-sm font-medium text-foreground">Course content</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {modules.length} modules • {lessonCount} lessons
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {modules.map((module, moduleIndex) => (
          <section key={module.id} className="border-b border-border/10">
            <div className="bg-surface-100 px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Module {moduleIndex + 1}
              </div>
              <h4 className="mt-1 text-sm font-medium text-foreground">
                {module.title || "Untitled module"}
              </h4>
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
                    className={`flex w-full gap-3 border-t border-border/10 px-4 py-3 text-left transition-all duration-150 ${
                      isActive
                        ? "bg-surface-300 text-foreground"
                        : "text-foreground hover:bg-surface-100"
                    }`}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/10 text-[11px] text-muted-foreground">
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

export default function PreviewCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [course, setCourse] = useState<CourseFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      const result = await graphqlFetch<AdminCoursesData>({
        query: adminCoursesQuery,
      });
      const backendCourse = result.courses.find(
        (item) => String(item.id) === params.id
      );

      if (!isMounted) return;

      if (!backendCourse) {
        setCourse(null);
        setError("Course not found.");
        return;
      }

      setCourse(getCourseFormData(backendCourse));
      setError(null);
    }

    setIsLoading(true);
    loadCourse()
      .catch((err) => {
        if (isMounted) {
          setCourse(null);
          setError(err instanceof Error ? err.message : "Unable to load course.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
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
    allLessons.find((lesson) => String(lesson.id) === String(activeLessonId)) ??
    null;

  const handleLessonSelect = (lessonId: string | number) => {
    router.push(`/courses/${params.id}/preview?lesson=${lessonId}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-xl font-medium text-foreground">
            Loading course preview
          </h1>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-xl font-medium text-foreground">
            Course not found
          </h1>
          <p className="mt-2 text-muted-foreground">
            {error || "This course may have been deleted or moved."}
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="mt-4 cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/10 px-4 bg-background">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex-1 min-w-0">
          <h2
            className="text-sm font-medium truncate text-foreground text-right"
            style={{ letterSpacing: "-0.11px" }}
          >
            {course.title}
          </h2>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="ml-1 text-sm">Exit Preview</span>
        </Button>
      </div>

      {/* Main content */}
      <main className="min-h-0 flex-1 overflow-hidden">
        {activeLesson ? (
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-h-0 overflow-y-auto px-4 py-4 md:px-6 lg:px-8">
              <LessonContent lesson={activeLesson} courseTitle={course.title} />
            </div>
            <CourseLessonsSidebar
              modules={course.modules}
              activeLessonId={activeLessonId}
              onLessonSelect={handleLessonSelect}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FileText className="h-16 w-16 mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium text-foreground">
              No lessons yet
            </h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              This course doesn&apos;t have any lessons yet. Add modules and
              lessons from the course editor to preview them here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
