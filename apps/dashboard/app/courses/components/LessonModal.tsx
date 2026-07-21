"use client";

import { useEffect, useState } from "react";
import { CodeLessonFields } from "./lesson-modal/CodeLessonFields";
import { LessonDetailsFields } from "./lesson-modal/LessonDetailsFields";
import { LessonModalFooter } from "./lesson-modal/LessonModalFooter";
import { LessonModalHeader } from "./lesson-modal/LessonModalHeader";
import { QuizLessonFields } from "./lesson-modal/QuizLessonFields";
import { TextLessonFields } from "./lesson-modal/TextLessonFields";
import {
  LessonFormData,
  LessonModalProps,
  QuizQuestion,
  QuizType,
} from "./lesson-modal/types";
import { VideoLessonFields } from "./lesson-modal/VideoLessonFields";

export type { LessonFormData, LessonModalProps, QuizQuestion, QuizType } from "./lesson-modal/types";

const getInitialLessonFormData = (
  lessonType: LessonModalProps["lessonType"]
): LessonFormData => ({
  title: "",
  type: lessonType,
  duration: "",
  url: "",
  content: "",
  questions: [],
  quizType: lessonType === "quiz" ? "multiple-choice" : undefined,
});

export default function LessonModal({
  isOpen,
  lessonType,
  initialData,
  onSave,
  onClose,
}: LessonModalProps) {
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>(
    getInitialLessonFormData(lessonType)
  );

  useEffect(() => {
    if (isOpen) {
      setLessonFormData(
        initialData ?? getInitialLessonFormData(lessonType),
      );
    }
  }, [initialData, isOpen, lessonType]);

  const addQuestion = () => {
    const quizType = lessonFormData.quizType || "multiple-choice";
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: "",
      type: quizType,
      options: quizType === "true-false" ? ["True", "False"] : ["", "", ""],
      correctAnswer: quizType === "multiple-choice" ? 0 : undefined,
      correctItems: quizType === "drag-drop" ? [] : undefined,
      answer: quizType === "true-false" ? "True" : undefined,
      hint: "",
    };

    setLessonFormData((currentData) => ({
      ...currentData,
      questions: [...(currentData.questions || []), newQuestion],
    }));
  };

  const removeQuestion = (questionId: number) => {
    setLessonFormData((currentData) => ({
      ...currentData,
      questions:
        currentData.questions?.filter((question) => question.id !== questionId) || [],
    }));
  };

  const updateQuestion = (questionId: number, updates: Partial<QuizQuestion>) => {
    setLessonFormData((currentData) => ({
      ...currentData,
      questions:
        currentData.questions?.map((question) =>
          question.id === questionId ? { ...question, ...updates } : question
        ) || [],
    }));
  };

  const updateQuizType = (type: QuizType) => {
    setLessonFormData((currentData) => ({
      ...currentData,
      quizType: type,
      questions:
        currentData.questions?.map((question) => ({
          ...question,
          type,
          options: type === "true-false" ? ["True", "False"] : question.options,
          correctAnswer: type === "multiple-choice" ? 0 : undefined,
          correctItems: type === "drag-drop" ? [] : undefined,
          answer: type === "true-false" ? "True" : undefined,
        })) || [],
    }));
  };

  const handleSave = () => {
    onSave(lessonFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20"
      onClick={onClose}
    >
      <div
        className="flex h-[calc(100dvh-2rem)] max-h-[44rem] w-full max-w-lg flex-col overflow-hidden rounded-lg shadow-2xl bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <LessonModalHeader
          lessonType={lessonType}
          isEditing={Boolean(initialData)}
          onClose={onClose}
        />

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-6">
          <LessonDetailsFields
            lessonFormData={lessonFormData}
            onDurationChange={(duration) =>
              setLessonFormData((currentData) => ({ ...currentData, duration }))
            }
          />

          {lessonType === "video" && (
            <VideoLessonFields
              lessonFormData={lessonFormData}
              onUrlChange={(url) =>
                setLessonFormData((currentData) => ({ ...currentData, url }))
              }
            />
          )}

          {lessonType === "text" && (
            <TextLessonFields
              lessonFormData={lessonFormData}
              onContentChange={(content) =>
                setLessonFormData((currentData) => ({ ...currentData, content }))
              }
            />
          )}

          {lessonType === "code" && (
            <CodeLessonFields
              lessonFormData={lessonFormData}
              onContentChange={(content) =>
                setLessonFormData((currentData) => ({ ...currentData, content }))
              }
            />
          )}

          {lessonType === "quiz" && (
            <QuizLessonFields
              questions={lessonFormData.questions || []}
              quizType={lessonFormData.quizType}
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              onRemoveQuestion={removeQuestion}
              onUpdateQuizType={updateQuizType}
            />
          )}
        </div>

        <LessonModalFooter
          lessonType={lessonType}
          isEditing={Boolean(initialData)}
          onClose={onClose}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
