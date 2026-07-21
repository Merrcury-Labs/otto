import type { QuizQuestion } from "./components/LessonModal";

export type CourseStatus = "published" | "draft" | "archived";

export interface Lesson {
  id: number | string;
  title: string;
  type: "video" | "text" | "quiz" | "code";
  duration?: string;
  url?: string;
  content?: string;
  questions?: QuizQuestion[];
}

export interface CourseModule {
  id: number | string;
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
  tutorId?: string;
  title: string;
  description: string;
  thumbnail: string;
  prerequisites: string[];
  tags: string[];
  modules: CourseModule[];
}
