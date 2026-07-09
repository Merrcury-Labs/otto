export type QuestionType =
  | "multiple-choice"
  | "drag-drop-category"
  | "drag-drop-order"
  | "true-false"
  | "checkbox";

export type QuizStatus = "published" | "draft";

export interface QuizQuestion {
  id: number;
  question: string;
  type: QuestionType;
  points: number;
  options: string[];
  correctAnswer?: string | boolean | number | number[] | Record<string, unknown> | unknown[];
  categories?: string[];
  categoryMapping?: Record<number, number>;
  hint?: string;
}

export interface QuizFormData {
  title: string;
  description: string;
  duration: string;
  courseId?: string;
  courseTitle?: string;
  questions: QuizQuestion[];
}

export interface Quiz extends QuizFormData {
  id: number;
  status: QuizStatus;
  attempts: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
}

export const questionTypeLabels: Record<QuestionType, string> = {
  "multiple-choice": "Multiple Choice",
  "drag-drop-category": "Drag & Drop (Categories)",
  "drag-drop-order": "Drag & Drop (Order)",
  "true-false": "True/False",
  checkbox: "Checkbox",
};
