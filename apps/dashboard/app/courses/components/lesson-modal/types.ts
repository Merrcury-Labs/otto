"use client";

export type QuizType =
  | "multiple-choice"
  | "drag-drop"
  | "checkbox"
  | "true-false";

export interface QuizQuestion {
  id: number;
  question: string;
  type: QuizType;
  options: string[];
  correctAnswer?: number | number[];
  correctItems?: number[];
  answer?: string;
  hint?: string;
}

export interface LessonFormData {
  title: string;
  type: "video" | "text" | "quiz" | "code";
  duration: string;
  url?: string;
  content?: string;
  questions?: QuizQuestion[];
  quizType?: QuizType;
}

export interface LessonModalProps {
  isOpen: boolean;
  lessonType: "video" | "text" | "quiz" | "code";
  initialData?: LessonFormData | null;
  onSave: (data: LessonFormData) => void;
  onClose: () => void;
}
