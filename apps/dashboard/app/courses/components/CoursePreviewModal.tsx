"use client";

import { BookOpen, Check, Code, FileText, Play, X } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import Image from "next/image";
import type { CourseFormData, Lesson } from "../types";

interface CoursePreviewModalProps {
  course: CourseFormData;
  isOpen: boolean;
  onClose: () => void;
}

const lessonTypeLabels: Record<Lesson["type"], string> = {
  video: "Video",
  text: "Reading",
  quiz: "Quiz",
  code: "Exercise",
};

function LessonTypeIcon({ type }: { type: Lesson["type"] }) {
  if (type === "video") return <Play className="h-3.5 w-3.5" />;
  if (type === "quiz") return <Check className="h-3.5 w-3.5" />;
  if (type === "code") return <Code className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

export function CoursePreviewModal({
  course,
  isOpen,
  onClose,
}: CoursePreviewModalProps) {
  if (!isOpen) return null;

  const totalLessons = course.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );
  const quizCount = course.modules.reduce(
    (acc, module) =>
      acc + module.lessons.filter((lesson) => lesson.type === "quiz").length,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl"
        style={{ backgroundColor: "#e6e5e0" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b p-6"
          style={{ borderColor: "rgba(38, 37, 30, 0.1)" }}
        >
          <div>
            <h2
              className="text-xl font-normal"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              Student Course Preview
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            >
              A learner-facing view of the course landing page
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="cursor-btn-hover focus-warm transition-all duration-150"
            style={{ color: "#26251e" }}
            aria-label="Close student preview"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              <div
                className="overflow-hidden rounded-xl border"
                style={{
                  backgroundColor: "#f7f7f4",
                  borderColor: "rgba(38, 37, 30, 0.1)",
                }}
              >
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt="Course hero thumbnail"
                    className="h-72 w-full object-cover"
                    width={1024}
                    height={576}
                    unoptimized
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center">
                    <div className="text-center">
                      <BookOpen
                        className="h-10 w-10 mx-auto mb-3"
                        style={{ color: "rgba(38, 37, 30, 0.35)" }}
                      />
                      <p
                        className="text-sm"
                        style={{ color: "rgba(38, 37, 30, 0.55)" }}
                      >
                        Course thumbnail appears here for students
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3
                  className="text-3xl font-normal mb-3"
                  style={{ color: "#26251e", letterSpacing: "-0.11px" }}
                >
                  {course.title || "Untitled Course"}
                </h3>
                <p
                  className="text-base leading-7"
                  style={{ color: "rgba(38, 37, 30, 0.75)" }}
                >
                  {course.description ||
                    "Your course description will help students understand the value of this course."}
                </p>
              </div>

              {course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1.5 text-sm pill-shape"
                      style={{
                        backgroundColor: "#ebeae5",
                        color: "#26251e",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {course.prerequisites.length > 0 && (
                <div
                  className="rounded-xl border p-5"
                  style={{
                    backgroundColor: "#f7f7f4",
                    borderColor: "rgba(38, 37, 30, 0.1)",
                  }}
                >
                  <h4
                    className="text-lg font-medium mb-4"
                    style={{ color: "#26251e" }}
                  >
                    Prerequisites
                  </h4>
                  <ul className="list-disc space-y-2 pl-5">
                    {course.prerequisites.map((prerequisite) => (
                      <li
                        key={prerequisite}
                        style={{ color: "rgba(38, 37, 30, 0.75)" }}
                      >
                        {prerequisite}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "#f7f7f4",
                  borderColor: "rgba(38, 37, 30, 0.1)",
                }}
              >
                <h4
                  className="text-lg font-medium mb-4"
                  style={{ color: "#26251e" }}
                >
                  Course Overview
                </h4>
                <div
                  className="space-y-3 text-sm"
                  style={{ color: "rgba(38, 37, 30, 0.75)" }}
                >
                  <div className="flex items-center justify-between">
                    <span>Modules</span>
                    <span>{course.modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lessons</span>
                    <span>{totalLessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Quizzes</span>
                    <span>{quizCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Thumbnail</span>
                    <span>{course.thumbnail ? "Added" : "Missing"}</span>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "#f7f7f4",
                  borderColor: "rgba(38, 37, 30, 0.1)",
                }}
              >
                <h4
                  className="text-lg font-medium mb-4"
                  style={{ color: "#26251e" }}
                >
                  Course Content
                </h4>
                <div className="space-y-3">
                  {course.modules.length > 0 ? (
                    course.modules.map((module, moduleIndex) => (
                      <div
                        key={module.id}
                        className="rounded-lg border p-4"
                        style={{
                          backgroundColor: "#ebeae5",
                          borderColor: "rgba(38, 37, 30, 0.1)",
                        }}
                      >
                        <div
                          className="text-sm font-medium mb-1"
                          style={{ color: "#26251e" }}
                        >
                          Module {moduleIndex + 1}:{" "}
                          {module.title || `Untitled Module ${moduleIndex + 1}`}
                        </div>
                        <div
                          className="text-xs mb-3"
                          style={{ color: "rgba(38, 37, 30, 0.55)" }}
                        >
                          {module.lessons.length} lessons
                        </div>
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="rounded-md px-3 py-2 text-sm"
                              style={{
                                backgroundColor: "#f7f7f4",
                                color: "#26251e",
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <LessonTypeIcon type={lesson.type} />
                                <span>
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                              </div>
                              <div
                                className="mt-1 flex flex-wrap items-center gap-2 text-xs"
                                style={{ color: "rgba(38, 37, 30, 0.55)" }}
                              >
                                <span>{lessonTypeLabels[lesson.type]}</span>
                                {lesson.duration && <span>{lesson.duration}</span>}
                                {lesson.questions && (
                                  <span>{lesson.questions.length} questions</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      className="text-sm"
                      style={{ color: "rgba(38, 37, 30, 0.55)" }}
                    >
                      Add modules and lessons to preview the student curriculum.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
