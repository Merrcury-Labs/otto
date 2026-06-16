import type { QuizQuestion } from "./components/LessonModal";

export type CourseStatus = "published" | "draft" | "archived";

export interface Lesson {
  id: number;
  title: string;
  type: "video" | "text" | "quiz" | "code";
  duration?: string;
  url?: string;
  content?: string;
  questions?: QuizQuestion[];
}

export interface CourseModule {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: number | string;
  title: string;
  description: string;
  status: CourseStatus;
  students: number;
  quizzes: number;
  progress: number;
  duration: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  prerequisites: string[];
  tags: string[];
  modules: CourseModule[];
}

export interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  prerequisites: string[];
  tags: string[];
  modules: CourseModule[];
}
