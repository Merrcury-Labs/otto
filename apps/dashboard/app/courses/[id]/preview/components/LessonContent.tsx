"use client";

import { useEffect, useState } from "react";
import {
  ChatCircleText,
  Check,
  Code,
  FileText,
  Play,
} from "@phosphor-icons/react";
import { MarkdownPreview } from "../../../components/lesson-modal/MarkdownPreview";
import type { Lesson } from "../../../types";
import { getLessonTypeLabel, getYouTubeEmbedUrl } from "../../../utils";

interface LessonContentProps {
  lesson: Lesson;
  courseTitle: string;
}

// ---------------------------------------------------------------------------
// Notes component — persisted per lesson in localStorage
// ---------------------------------------------------------------------------

const getNotesKey = (lessonId: string | number) =>
  `otto-preview-notes-${lessonId}`;

function LessonNotes({ lessonId }: { lessonId: string | number }) {
  const [notes, setNotes] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
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
    <div className="rounded-lg border border-border/10 bg-surface-100 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/10 px-4 py-2.5">
        <ChatCircleText className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Comments
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Add a comment..."
        rows={6}
        className="w-full resize-y rounded-none border-0 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson type badge
// ---------------------------------------------------------------------------

function LessonTypeBadge({ type }: { type: Lesson["type"] }) {
  const iconMap = {
    video: <Play className="h-3.5 w-3.5" />,
    text: <FileText className="h-3.5 w-3.5" />,
    quiz: <Check className="h-3.5 w-3.5" />,
    code: <Code className="h-3.5 w-3.5" />,
  };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-surface-300 text-foreground">
      {iconMap[type]}
      {getLessonTypeLabel(type)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Lesson type renderers
// ---------------------------------------------------------------------------

function VideoLesson({ lesson }: { lesson: Lesson }) {
  const embedUrl = lesson.url ? getYouTubeEmbedUrl(lesson.url) : null;

  return (
    <div className="space-y-5">
      {embedUrl ? (
        <div className="overflow-hidden rounded-lg border border-border/10 bg-black shadow-sm">
          <iframe
            src={embedUrl}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : lesson.url ? (
        <div className="overflow-hidden rounded-lg border border-border/10 bg-black shadow-sm">
          <iframe
            src={lesson.url}
            className="aspect-video w-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/10 py-24 text-center">
          <Play className="h-12 w-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">
            No video configured
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a video URL to this lesson to see it here.
          </p>
        </div>
      )}

      <LessonNotes lessonId={lesson.id} />
    </div>
  );
}

function TextLesson({ lesson }: { lesson: Lesson }) {
  if (!lesson.content) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/10 py-20 text-center">
        <FileText className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">
          No reading content yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add content to this lesson to see it rendered here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-lg border border-border/10 bg-surface-100 p-6 shadow-sm md:p-8">
        <MarkdownPreview content={lesson.content} />
      </div>
    </div>
  );
}

function CodeLesson({ lesson }: { lesson: Lesson }) {
  if (!lesson.content) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/10 py-20 text-center">
        <Code className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">
          No exercise instructions yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add content to this exercise to see it rendered here.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl border border-border/10 bg-surface-100 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/10 px-4 py-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Exercise
          </span>
        </div>
        <div className="p-6">
          <MarkdownPreview content={lesson.content} />
        </div>
      </div>
    </div>
  );
}

function QuizQuestionCard({
  question,
  index,
}: {
  question: Lesson["questions"] extends (infer Q)[] | undefined ? Q : never;
  index: number;
}) {
  if (!question) return null;

  return (
    <div className="rounded-xl border border-border/10 p-5 bg-surface-100">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Question {index + 1}
      </div>
      <h4 className="mb-4 text-base font-medium text-foreground">
        {question.question || `Untitled question`}
      </h4>

      {question.options && question.options.length > 0 && (
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className="flex items-center gap-3 rounded-lg border border-border/10 px-4 py-3 bg-card text-foreground"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/10 text-xs text-muted-foreground">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="text-sm">{option || `Option ${optionIndex + 1}`}</span>
            </div>
          ))}
        </div>
      )}

      {question.hint && (
        <div className="mt-4 rounded-md px-3 py-2 text-sm bg-surface-300 text-muted-foreground">
          Hint: {question.hint}
        </div>
      )}
    </div>
  );
}

function QuizLesson({ lesson }: { lesson: Lesson }) {
  const questions = lesson.questions ?? [];

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/10 py-20 text-center">
        <Check className="h-12 w-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">
          No questions yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add questions to this quiz to preview them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/10 p-5 bg-surface-100">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Check className="h-4 w-4" />
          <span>{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {questions.map((question, index) => (
        <QuizQuestionCard key={question.id} question={question} index={index} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function LessonContent({
  lesson,
  courseTitle,
}: LessonContentProps) {
  return (
    <section className="min-h-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <LessonTypeBadge type={lesson.type} />
        {lesson.duration && (
          <span className="text-xs text-muted-foreground">
            {lesson.duration}
          </span>
        )}
      </div>
      <h2
        className="text-2xl font-normal text-foreground"
        style={{ letterSpacing: "-0.11px" }}
      >
        {lesson.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{courseTitle}</p>

      <div className="mt-5">
        {lesson.type === "video" && <VideoLesson lesson={lesson} />}
        {lesson.type === "text" && <TextLesson lesson={lesson} />}
        {lesson.type === "code" && (
          <div className="mx-auto max-w-4xl">
            <CodeLesson lesson={lesson} />
            <div className="mt-5">
              <LessonNotes lessonId={lesson.id} />
            </div>
          </div>
        )}
        {lesson.type === "quiz" && (
          <div className="mx-auto max-w-4xl">
            <QuizLesson lesson={lesson} />
            <div className="mt-5">
              <LessonNotes lessonId={lesson.id} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
