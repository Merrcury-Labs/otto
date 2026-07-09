import type { QuizFormData, QuizQuestion, QuestionType } from "./types";
import { graphqlFetch } from "../../lib/graphql/client";
import {
  createQuizMutation,
  createQuestionMutation,
} from "../../lib/graphql/quizzes";

const getDurationValue = (duration: string) => {
  const value = duration.trim().toLowerCase();
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minutes = value.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);
  const seconds = value.match(/(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds)/);

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.split(":").length === 2 ? `00:${value}` : value;
  }

  const totalSeconds =
    Math.round(Number(hours?.[1] ?? 0) * 3600) +
    Math.round(Number(minutes?.[1] ?? 0) * 60) +
    Math.round(Number(seconds?.[1] ?? 0));

  if (!totalSeconds) return "00:00:00";

  const formattedHours = Math.floor(totalSeconds / 3600);
  const formattedMinutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedSeconds = totalSeconds % 60;

  return [formattedHours, formattedMinutes, formattedSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

const extractRecordId = (result: unknown): string | null => {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const id = record.id ?? record.uuid ?? record.pk;

  if (typeof id === "string" || typeof id === "number") return String(id);

  for (const value of Object.values(record)) {
    const nestedId = extractRecordId(value);

    if (nestedId) return nestedId;
  }

  return null;
};

const mapQuestionType = (type: QuestionType): string => {
  const typeMap: Record<QuestionType, string> = {
    "multiple-choice": "MCQ",
    checkbox: "MCQ",
    "true-false": "TF",
    "drag-drop-order": "REORDER",
    "drag-drop-category": "CATEGORIZE",
  };
  return typeMap[type];
};

const getCorrectOption = (question: QuizQuestion): unknown => {
  switch (question.type) {
    case "multiple-choice":
    case "true-false":
      return question.correctAnswer ?? 0;
    case "checkbox":
      return question.correctAnswer ?? [];
    case "drag-drop-order":
      return question.options.map((_, index) => index);
    case "drag-drop-category":
      return question.categoryMapping ?? {};
    default:
      return question.correctAnswer ?? 0;
  }
};

const getOptions = (question: QuizQuestion): unknown => {
  if (question.type === "drag-drop-category") {
    return {
      items: question.options,
      categories: question.categories ?? [],
    };
  }
  return question.options;
};

const getQuestionPayload = (question: QuizQuestion) => {
  const type = mapQuestionType(question.type);
  const correctOption = getCorrectOption(question);
  const options = getOptions(question);

  return {
    text: question.question,
    correctOption,
    type,
    options,
    points: question.points,
  };
};

const saveQuestions = async (questions: QuizQuestion[], quizId: string) => {
  await Promise.all(
    questions.map((question) => {
      const payload = getQuestionPayload(question);
      return graphqlFetch<unknown>({
        query: createQuestionMutation,
        variables: {
          quizId,
          ...payload,
        },
      });
    })
  );
};

export async function saveQuiz(formData: QuizFormData) {
  if (!formData.courseId) {
    throw new Error("A course must be selected to create a quiz.");
  }

  const quizVariables = {
    courseId: formData.courseId,
    title: formData.title,
    description: formData.description,
    length: getDurationValue(formData.duration || ""),
    numQuestions: formData.questions.length,
    author: "admin",
    passingScore: 50.0,
  };

  console.log("saveQuiz — createQuiz variables:", quizVariables);

  const quizResult = await graphqlFetch<unknown>({
    query: createQuizMutation,
    variables: quizVariables,
  });

  const quizId = extractRecordId(quizResult);

  if (!quizId) {
    throw new Error(
      "Quiz saved, but the response did not include a quiz ID for questions."
    );
  }

  if (formData.questions.length > 0) {
    console.log(
      "saveQuiz — creating questions for quizId:",
      quizId,
      "\nquestion payloads:",
      formData.questions.map(getQuestionPayload)
    );
    await saveQuestions(formData.questions, quizId);
  }

  return quizResult;
}
