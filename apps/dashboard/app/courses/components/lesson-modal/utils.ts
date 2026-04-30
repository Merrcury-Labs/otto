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

export const parseMarkdown = (markdown: string): string => {
  if (!markdown) return "";

  let html = markdown;

  html = html.replace(
    /^### (.*$)/gim,
    '<h3 style="font-size: 1.25em; font-weight: 600; margin: 0.83em 0; color: #26251e;">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 style="font-size: 1.5em; font-weight: 600; margin: 0.75em 0; color: #26251e;">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 style="font-size: 2em; font-weight: 700; margin: 0.67em 0; color: #26251e;">$1</h1>'
  );

  html = html.replace(
    /\*\*(.*)\*\*/gim,
    '<strong style="font-weight: 600; color: #26251e;">$1</strong>'
  );
  html = html.replace(
    /\*(.*)\*/gim,
    '<em style="font-style: italic; color: #26251e;">$1</em>'
  );

  html = html.replace(
    /```([\s\S]*?)```/gim,
    '<pre style="background-color: #e6e5e0; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin: 1em 0; color: #26251e;"><code style="background-color: transparent; padding: 0;">$1</code></pre>'
  );
  html = html.replace(
    /`([^`]+)`/gim,
    '<code style="background-color: #e6e5e0; padding: 0.125em 0.25em; border-radius: 0.25em; font-size: 0.875em; color: #26251e;">$1</code>'
  );

  html = html.replace(
    /^\- (.*$)/gim,
    '<li style="margin: 0.25em 0; color: #26251e;">$1</li>'
  );
  html = html.replace(
    /^([0-9]+)\. (.*$)/gim,
    '<li style="margin: 0.25em 0; color: #26251e;">$2</li>'
  );

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    '<a href="$2" target="_blank" style="color: #26251e; text-decoration: underline;">$1</a>'
  );

  html = html.replace(
    /\n\n/gim,
    '</p><p style="margin: 1em 0; color: #26251e;">'
  );
  html = html.replace(/\n/gim, "<br>");

  return html;
};
