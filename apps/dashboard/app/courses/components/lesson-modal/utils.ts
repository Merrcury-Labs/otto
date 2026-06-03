import { QuizType } from "./types";

export const getLessonTypeLabel = (type: string) => {
  switch (type) {
    case "video":
      return "Video";
    case "text":
      return "Reading";
    case "quiz":
      return "Quiz";
    case "code":
      return "Exercise";
    default:
      return "Lesson";
  }
};

export const getQuizTypeLabel = (quizType?: QuizType) => {
  switch (quizType) {
    case "multiple-choice":
      return "multiple choice";
    case "drag-drop":
      return "drag and drop";
    case "checkbox":
      return "checkbox";
    case "true-false":
      return "true/false";
    default:
      return "quiz";
  }
};
