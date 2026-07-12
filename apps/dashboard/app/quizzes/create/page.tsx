"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ArrowLeft,
  Plus,
  Trash,
  Check,
  X,
  ArrowsLeftRight,
  Brain,
  Clock,
  BookOpen,
  Tag,
  DotsSixVertical,
  ListChecks,
  Circle,
  CircleHalf,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import type { QuizFormData, QuizQuestion, QuestionType } from "../types";
import { questionTypeLabels } from "../types";
import { saveQuiz } from "../persistence";
import { graphqlFetch } from "../../../lib/graphql/client";
import { courseListQuery } from "../../../lib/graphql/courses";

type CourseOption = {
  id: string;
  title: string;
};

const MIN_CATEGORY_COUNT = 2;
const MAX_CATEGORY_COUNT = 6;

function QuestionPreviewCard({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [categoryAssignments, setCategoryAssignments] = useState<Record<number, number>>({});
  const [availableItems, setAvailableItems] = useState<number[]>(
    question.options.map((_, optionIndex) => optionIndex)
  );
  const [orderedItems, setOrderedItems] = useState<number[]>(
    question.options.map((_, optionIndex) => optionIndex)
  );

  const moveItemToCategory = (optionIndex: number, categoryIndex: number) => {
    setAvailableItems((currentItems) =>
      currentItems.filter((itemIndex) => itemIndex !== optionIndex)
    );
    setCategoryAssignments((currentAssignments) => ({
      ...currentAssignments,
      [optionIndex]: categoryIndex,
    }));
  };

  const returnItemToPool = (optionIndex: number) => {
    setCategoryAssignments((currentAssignments) => {
      const nextAssignments = { ...currentAssignments };
      delete nextAssignments[optionIndex];
      return nextAssignments;
    });
    setAvailableItems((currentItems) =>
      currentItems.includes(optionIndex) ? currentItems : [...currentItems, optionIndex]
    );
  };

  const moveOrderedItem = (fromIndex: number, toIndex: number) => {
    setOrderedItems((currentItems) => {
      const nextItems = [...currentItems];
      const [movedItem] = nextItems.splice(fromIndex, 1);
      if (movedItem === undefined) return currentItems;
      nextItems.splice(toIndex, 0, movedItem);
      return nextItems;
    });
  };

  return (
    <div
      className="rounded-xl border p-5 bg-surface-100 border-border/10"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div
            className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Question {index + 1}
          </div>
          <h3 className="text-base font-medium text-foreground">
            {question.question || `Untitled ${question.type} question`}
          </h3>
        </div>
        <div
          className="rounded-full px-3 py-1 text-xs bg-surface-300 text-foreground"
        >
          {question.points} pt
        </div>
      </div>

      {question.type === "multiple-choice" && (
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              type="button"
              onClick={() => setSelectedOption(optionIndex)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 ${
                selectedOption === optionIndex
                  ? "bg-surface-300 border-foreground text-foreground"
                  : "bg-card border-border/10 text-foreground"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  selectedOption === optionIndex
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-foreground text-foreground"
                }`}
              >
                {selectedOption === optionIndex && <Check className="h-3 w-3" />}
              </span>
              <span>{option || `Option ${optionIndex + 1}`}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === "checkbox" && (
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedOptions.includes(optionIndex);
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() =>
                  setSelectedOptions((currentOptions) =>
                    currentOptions.includes(optionIndex)
                      ? currentOptions.filter((itemIndex) => itemIndex !== optionIndex)
                      : [...currentOptions, optionIndex]
                  )
                }
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-surface-300 border-foreground text-foreground"
                    : "bg-card border-border/10 text-foreground"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-foreground text-foreground"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span>{option || `Option ${optionIndex + 1}`}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === "true-false" && (
        <div className="grid gap-3 md:grid-cols-2">
          {question.options.map((option, optionIndex) => (
            <button
              key={optionIndex}
              type="button"
              onClick={() => setSelectedOption(optionIndex)}
              className={`rounded-lg border px-4 py-4 text-left transition-all duration-150 ${
                selectedOption === optionIndex
                  ? "bg-surface-300 border-foreground text-foreground"
                  : "bg-card border-border/10 text-foreground"
              }`}
            >
              {option || (optionIndex === 0 ? "True" : "False")}
            </button>
          ))}
        </div>
      )}

      {question.type === "drag-drop-category" && (
        <div className="space-y-4">
          <div
            className="rounded-lg border-2 border-dashed p-4 bg-card border-border/15"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const optionIndex = Number(e.dataTransfer.getData("text/plain"));
              if (Number.isNaN(optionIndex)) return;
              returnItemToPool(optionIndex);
            }}
          >
            <div
              className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Available Answers
            </div>
            <div className="flex flex-wrap gap-2">
              {availableItems.map((optionIndex) => (
                <div
                  key={optionIndex}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", optionIndex.toString())
                  }
                  className="flex items-center gap-2 rounded-full px-3 py-2 bg-surface-100 text-foreground"
                >
                  <ArrowsLeftRight className="h-4 w-4" />
                  <span className="text-sm">
                    {question.options[optionIndex] || `Item ${optionIndex + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(question.categories || []).map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="rounded-lg border p-4 bg-card border-border/10"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const optionIndex = Number(e.dataTransfer.getData("text/plain"));
                  if (Number.isNaN(optionIndex)) return;
                  moveItemToCategory(optionIndex, categoryIndex);
                }}
              >
                <div
                  className="mb-3 text-sm font-medium text-foreground"
                >
                  {category || `Category ${categoryIndex + 1}`}
                </div>
                <div className="space-y-2">
                  {Object.entries(categoryAssignments)
                    .filter(([, mappedIndex]) => mappedIndex === categoryIndex)
                    .map(([optionKey]) => {
                      const optionIndex = Number(optionKey);
                      return (
                        <div
                          key={optionIndex}
                          draggable
                          onDragStart={(e) =>
                            e.dataTransfer.setData(
                              "text/plain",
                              optionIndex.toString()
                            )
                          }
                          className="flex items-center justify-between rounded-md px-3 py-2 bg-surface-100 text-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowsLeftRight className="h-4 w-4" />
                            <span className="text-sm">
                              {question.options[optionIndex] ||
                                `Item ${optionIndex + 1}`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => returnItemToPool(optionIndex)}
                            className="text-xs underline text-muted-foreground"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {question.type === "drag-drop-order" && (
        <div className="space-y-2">
          {orderedItems.map((optionIndex, orderIndex) => (
            <div
              key={optionIndex}
              className="flex items-center gap-3 rounded-lg border px-4 py-3 bg-card border-border/10 text-foreground"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs bg-surface-100"
              >
                {orderIndex + 1}
              </span>
              <span className="flex-1">
                {question.options[optionIndex] || `Step ${optionIndex + 1}`}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={orderIndex === 0}
                  onClick={() => moveOrderedItem(orderIndex, orderIndex - 1)}
                  className={`rounded px-2 py-1 text-xs text-foreground ${
                    orderIndex === 0 ? "bg-surface-300" : "bg-surface-100"
                  }`}
                  style={{
                    opacity: orderIndex === 0 ? 0.5 : 1,
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={orderIndex === orderedItems.length - 1}
                  onClick={() => moveOrderedItem(orderIndex, orderIndex + 1)}
                  className={`rounded px-2 py-1 text-xs text-foreground ${
                    orderIndex === orderedItems.length - 1 ? "bg-surface-300" : "bg-surface-100"
                  }`}
                  style={{
                    opacity:
                      orderIndex === orderedItems.length - 1 ? 0.5 : 1,
                  }}
                >
                  Down
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {question.hint && (
        <div
          className="mt-4 rounded-md px-3 py-2 text-sm bg-surface-300 text-muted-foreground"
        >
          Hint: {question.hint}
        </div>
      )}
    </div>
  );
}

export default function CreateQuizPage() {
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    duration: "",
    questions: [],
  });

  const [newQuestionType, setNewQuestionType] = useState<QuestionType>("multiple-choice");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        const result = await graphqlFetch<{ courses: Array<{ id: string; title: string }> }>({
          query: courseListQuery,
          operationName: "CourseList",
        });

        if (isMounted) {
          setCourses(
            result.courses.map((course) => ({
              id: course.id,
              title: course.title,
            }))
          );
        }
      } catch {
        // Courses failed to load — user will see empty dropdown
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: "",
      type: newQuestionType,
      points: 1,
      options:
        newQuestionType === "true-false"
          ? ["True", "False"]
          : newQuestionType === "drag-drop-category"
          ? ["", "", ""]
          : newQuestionType === "drag-drop-order"
          ? ["", "", ""]
          : ["", "", "", ""],
      categories:
        newQuestionType === "drag-drop-category" ? ["Category A", "Category B"] : undefined,
      categoryMapping:
        newQuestionType === "drag-drop-category" ? {} : undefined,
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const removeQuestion = (questionId: number | string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== questionId),
    });
  };

  const updateQuestion = (questionId: number | string, updates: Partial<QuizQuestion>) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const addOption = (questionId: number | string) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question) return;

    const maxOptions =
      question.type === "drag-drop-category" || question.type === "drag-drop-order"
        ? 8
        : 6;

    if (question.options.length >= maxOptions) return;

    updateQuestion(questionId, {
      options: [...question.options, ""],
    });
  };

  const removeOption = (questionId: number | string, optionIndex: number) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    const correctAnswer = Array.isArray(question.correctAnswer)
      ? question.correctAnswer.filter((i) => i !== optionIndex)
      : question.correctAnswer === optionIndex
      ? undefined
      : question.correctAnswer;

    const shiftedCategoryMapping =
      question.categoryMapping !== undefined
        ? Object.entries(question.categoryMapping).reduce<Record<number, number>>(
            (acc, [key, value]) => {
              const currentIndex = Number(key);
              if (currentIndex === optionIndex) {
                return acc;
              }

              const nextIndex = currentIndex > optionIndex ? currentIndex - 1 : currentIndex;
              acc[nextIndex] = value;
              return acc;
            },
            {}
          )
        : undefined;

    updateQuestion(questionId, {
      options: newOptions,
      correctAnswer,
      categoryMapping: shiftedCategoryMapping,
    });
  };

  const setCategoryCount = (questionId: number | string, categoryCount: number) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question || !question.categories) return;

    const normalizedCount = Math.max(
      MIN_CATEGORY_COUNT,
      Math.min(MAX_CATEGORY_COUNT, categoryCount)
    );

    const currentCategories = question.categories;
    const nextCategories =
      normalizedCount > currentCategories.length
        ? [
            ...currentCategories,
            ...Array.from(
              { length: normalizedCount - currentCategories.length },
              (_, index) =>
                `Category ${String.fromCharCode(65 + currentCategories.length + index)}`
            ),
          ]
        : currentCategories.slice(0, normalizedCount);

    const nextMapping =
      normalizedCount >= currentCategories.length
        ? question.categoryMapping
        : Object.entries(question.categoryMapping || {}).reduce<Record<number, number>>(
            (acc, [key, value]) => {
              if (value < normalizedCount) {
                acc[Number(key)] = value;
              }
              return acc;
            },
            {}
          );

    updateQuestion(questionId, {
      categories: nextCategories,
      categoryMapping: nextMapping,
    });
  };

  const updateCategory = (questionId: number | string, categoryIndex: number, name: string) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question || !question.categories) return;

    const newCategories = [...question.categories];
    newCategories[categoryIndex] = name;

    const newMapping = { ...(question.categoryMapping || {}) };
    Object.keys(newMapping).forEach((key) => {
      if (newMapping[Number(key)] === categoryIndex) {
        delete newMapping[Number(key)];
      }
    });

    updateQuestion(questionId, {
      categories: newCategories,
      categoryMapping: newMapping,
    });
  };

  const assignToCategory = (questionId: number | string, optionIndex: number, categoryIndex: number) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question || !question.categoryMapping) return;

    const newMapping = { ...(question.categoryMapping || {}) };
    newMapping[optionIndex] = categoryIndex;

    updateQuestion(questionId, {
      categoryMapping: newMapping,
    });
  };

  const unassignFromCategory = (questionId: number | string, optionIndex: number) => {
    const question = formData.questions.find((q) => q.id === questionId);
    if (!question || !question.categoryMapping) return;

    const newMapping = { ...question.categoryMapping };
    delete newMapping[optionIndex];

    updateQuestion(questionId, {
      categoryMapping: newMapping,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSavingQuiz(true);
    setSaveError(null);

    try {
      console.log("Creating quiz — formData:", formData);
      await saveQuiz(formData);
      router.push("/quizzes");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to create quiz."
      );
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const totalPoints = formData.questions.reduce((acc, q) => acc + q.points, 0);

  const isQuizReady = Boolean(formData.title && formData.description && formData.courseId);

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1
            className="text-3xl font-normal tracking-tight text-foreground"
            style={{ letterSpacing: "-0.11px" }}
          >
            Create Quiz
          </h1>
          <p className="text-base text-muted-foreground">
            Design questions and set scoring for your quiz
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Information */}
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200 bg-card rounded-lg"
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100"
              >
                <Brain className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle
                  className="text-xl font-normal text-foreground"
                  style={{ letterSpacing: "-0.11px" }}
                >
                  Quiz Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Basic details about your quiz
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Quiz Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter quiz title"
                className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Quiz Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this quiz covers..."
                rows={3}
                className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none bg-surface-100 border border-border/10 text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Time Limit (optional)
              </label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 15 minutes"
                  className="flex-1 px-4 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Assign to Course *
              </label>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <select
                  value={formData.courseId || ""}
                  onChange={(e) => {
                    const selectedCourse = courses.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      courseId: e.target.value || undefined,
                      courseTitle: selectedCourse?.title,
                    });
                  }}
                  disabled={isLoadingCourses}
                  className="flex-1 px-4 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                >
                  <option value="">
                    {isLoadingCourses ? "Loading courses..." : "Select a course..."}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200 bg-card rounded-lg"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100"
                >
                  <ListChecks className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <CardTitle
                    className="text-xl font-normal text-foreground"
                    style={{ letterSpacing: "-0.11px" }}
                  >
                    Questions ({formData.questions.length})
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Total Points: {totalPoints}
                  </CardDescription>
                </div>
              </div>
              {formData.questions.length > 0 && (
                <Button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
                >
                  Preview Quiz
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Question Type Selector */}
            <div className="space-y-3">
              <div
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Question Type
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {(Object.keys(questionTypeLabels) as QuestionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewQuestionType(type)}
                    className={`p-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-left ${
                      newQuestionType === type
                        ? "bg-primary text-white"
                        : "bg-surface-100 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {type === "multiple-choice" && <Circle className="h-4 w-4" />}
                      {type === "checkbox" && <CircleHalf className="h-4 w-4" />}
                      {type === "true-false" && <Check className="h-4 w-4" />}
                      {type === "drag-drop-category" && <ArrowsLeftRight className="h-4 w-4" />}
                      {type === "drag-drop-order" && <DotsSixVertical className="h-4 w-4" />}
                      <span className="text-xs font-medium">{questionTypeLabels[type]}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                type="button"
                onClick={addQuestion}
                className="w-full cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {questionTypeLabels[newQuestionType]} Question
              </Button>
            </div>

            {/* Questions List */}
            {formData.questions.length > 0 ? (
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border rounded-lg p-4 bg-surface-100 border-border/10"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <div
                          className="flex items-center gap-2 mb-2 text-muted-foreground"
                        >
                          <span className="text-xs font-medium">Question {index + 1}</span>
                          <span className="text-xs">•</span>
                          <span className="text-xs">{questionTypeLabels[question.type]}</span>
                          <span className="text-xs">•</span>
                          <span className="text-xs">{question.points} point(s)</span>
                        </div>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              question: e.target.value,
                            })
                          }
                          placeholder="Enter your question..."
                          className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-card">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(question.id, {
                                points: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-16 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-center bg-surface-300 border border-border/10 text-foreground"
                          />
                          <span className="text-xs text-muted-foreground">
                            pts
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeQuestion(question.id)}
                          className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Question Type Specific Content */}
                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        <div
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Answer Options
                        </div>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuestion(question.id, {
                                  correctAnswer: optionIndex,
                                })
                              }
                              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                                question.correctAnswer === optionIndex
                                  ? "bg-primary text-white border-primary"
                                  : "bg-card text-foreground border-border/20"
                              }`}
                            >
                              {question.correctAnswer === optionIndex && (
                                <Check className="h-3 w-3" />
                              )}
                            </button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, {
                                  options: newOptions,
                                });
                              }}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                            />
                            {question.options.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {question.options.length < 6 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        )}
                      </div>
                    )}

                    {question.type === "checkbox" && (
                      <div className="space-y-2">
                        <div
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Answer Options (Select all that apply)
                        </div>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const currentCorrect = Array.isArray(question.correctAnswer)
                                  ? question.correctAnswer
                                  : [];
                                const newCorrect = currentCorrect.includes(optionIndex)
                                  ? currentCorrect.filter((i) => i !== optionIndex)
                                  : [...currentCorrect, optionIndex];

                                updateQuestion(question.id, {
                                  correctAnswer: newCorrect,
                                });
                              }}
                              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                                Array.isArray(question.correctAnswer) &&
                                question.correctAnswer.includes(optionIndex)
                                  ? "bg-primary text-white border-primary"
                                  : "bg-card text-foreground border-border/20"
                              }`}
                            >
                              {Array.isArray(question.correctAnswer) &&
                                question.correctAnswer.includes(optionIndex) && (
                                  <Check className="h-3 w-3" />
                                )}
                            </button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[optionIndex] = e.target.value;
                                updateQuestion(question.id, {
                                  options: newOptions,
                                });
                              }}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {question.options.length < 6 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        )}
                      </div>
                    )}

                    {question.type === "true-false" && (
                      <div>
                        <div
                          className="text-xs font-medium mb-2 text-muted-foreground"
                        >
                          Correct Answer
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(question.id, {
                                correctAnswer: 0,
                              })
                            }
                            className={`flex-1 p-4 rounded-lg cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                              question.correctAnswer === 0
                                ? "bg-primary text-white border-primary"
                                : "bg-card text-foreground border-border/20"
                            }`}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            True
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(question.id, {
                                correctAnswer: 1,
                              })
                            }
                            className={`flex-1 p-4 rounded-lg cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                              question.correctAnswer === 1
                                ? "bg-primary text-white border-primary"
                                : "bg-card text-foreground border-border/20"
                            }`}
                          >
                            <X className="h-4 w-4 mr-2" />
                            False
                          </button>
                        </div>
                      </div>
                    )}

                    {question.type === "drag-drop-category" && (
                      <div className="space-y-4">
                        {/* Categories */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Categories
                            </div>
                            {question.categories && (
                              <div
                                className="flex items-center gap-2 px-3 py-2 rounded-md bg-card"
                              >
                                <span
                                  className="text-xs text-muted-foreground"
                                >
                                  Number of categories
                                </span>
                                <input
                                  type="number"
                                  min={MIN_CATEGORY_COUNT}
                                  max={MAX_CATEGORY_COUNT}
                                  value={question.categories.length}
                                  onChange={(e) =>
                                    setCategoryCount(
                                      question.id,
                                      parseInt(e.target.value, 10) || MIN_CATEGORY_COUNT
                                    )
                                  }
                                  className="w-16 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-center text-sm bg-surface-300 border border-border/10 text-foreground"
                                />
                              </div>
                            )}
                          </div>
                          {question.categories && (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {question.categories.map((category, catIndex) => (
                                <div
                                  key={catIndex}
                                  className="rounded-md border-2 p-3 bg-card border-border/10"
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const optionIndex = Number(
                                      e.dataTransfer.getData("text/plain")
                                    );
                                    if (Number.isNaN(optionIndex)) return;
                                    assignToCategory(question.id, optionIndex, catIndex);
                                  }}
                                >
                                  <input
                                    type="text"
                                    value={category}
                                    onChange={(e) =>
                                      updateCategory(question.id, catIndex, e.target.value)
                                    }
                                    placeholder="Category name"
                                    className="w-full px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm bg-surface-300 border border-border/10 text-foreground"
                                  />
                                  <div
                                    className="mt-3 min-h-24 rounded-md border-2 border-dashed p-3 bg-surface-300 border-border/15"
                                  >
                                    <div
                                      className="mb-2 text-xs font-medium text-muted-foreground"
                                    >
                                      Drop answers here
                                    </div>
                                    <div className="space-y-2">
                                      {question.options
                                        .map((option, optionIndex) => ({
                                          option,
                                          optionIndex,
                                        }))
                                        .filter(
                                          ({ optionIndex }) =>
                                            question.categoryMapping?.[optionIndex] === catIndex
                                        )
                                        .map(({ option, optionIndex }) => (
                                          <div
                                            key={optionIndex}
                                            draggable
                                            onDragStart={(e) => {
                                              e.dataTransfer.setData(
                                                "text/plain",
                                                optionIndex.toString()
                                              );
                                            }}
                                            className="flex items-center justify-between rounded-md px-3 py-2 bg-surface-100 text-foreground"
                                          >
                                            <div className="flex items-center gap-2">
                                              <ArrowsLeftRight
                                                className="h-4 w-4 text-muted-foreground"
                                              />
                                              <span className="text-sm">
                                                {option || `Item ${optionIndex + 1}`}
                                              </span>
                                            </div>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                unassignFromCategory(
                                                  question.id,
                                                  optionIndex
                                                )
                                              }
                                              className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Items to Categorize */}
                        <div className="space-y-2">
                          <div
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Items to Categorize
                          </div>
                          <div
                            className="rounded-md border-2 border-dashed p-3 bg-card border-border/15"
                            onDragOver={(e) => {
                              e.preventDefault();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const optionIndex = Number(
                                e.dataTransfer.getData("text/plain")
                              );
                              if (Number.isNaN(optionIndex)) return;
                              unassignFromCategory(question.id, optionIndex);
                            }}
                          >
                            <div
                              className="mb-3 text-xs font-medium text-muted-foreground"
                            >
                              Drag items from here into the right category box
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      optionIndex.toString()
                                    );
                                  }}
                                  className={`flex items-center gap-2 rounded-md border-2 p-2 bg-surface-100 ${
                                    question.categoryMapping?.[optionIndex] !== undefined
                                      ? "border-foreground"
                                      : "border-border/10"
                                  }`}
                                >
                                  <ArrowsLeftRight
                                    className="h-4 w-4 text-muted-foreground"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[optionIndex] = e.target.value;
                                      updateQuestion(question.id, {
                                        options: newOptions,
                                      });
                                    }}
                                    placeholder={`Item ${optionIndex + 1}`}
                                    className="flex-1 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 border border-border/10 text-foreground"
                                  />
                                  {question.categoryMapping?.[optionIndex] !== undefined && (
                                    <span
                                      className="rounded-full px-2 py-1 text-xs bg-surface-300 text-foreground"
                                    >
                                      {
                                        question.categories?.[
                                          question.categoryMapping[optionIndex] ?? 0
                                        ]
                                      }
                                    </span>
                                  )}
                                  {question.options.length > 2 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeOption(question.id, optionIndex)}
                                      className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {question.options.length < 8 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Item
                          </Button>
                        )}
                      </div>
                    )}

                    {question.type === "drag-drop-order" && (
                      <div className="space-y-2">
                        <div
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Items to Order (Drag to arrange in correct order)
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center gap-2 p-3 rounded-md border-2 cursor-move bg-card border-border/10"
                            >
                              <DotsSixVertical
                                className="h-5 w-5 text-muted-foreground"
                              />
                              <span className="text-sm font-medium w-6 text-muted-foreground">
                                {optionIndex + 1}.
                              </span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(question.id, {
                                    options: newOptions,
                                  });
                                }}
                                placeholder={`Step ${optionIndex + 1}`}
                                className="flex-1 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 border border-border/10 text-foreground"
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {question.options.length < 8 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                            className="cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Step
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Hint Field */}
                    <div className="mt-4">
                      <div
                        className="text-xs font-medium mb-1 text-muted-foreground"
                      >
                        Hint (Optional)
                      </div>
                      <input
                        type="text"
                        value={question.hint || ""}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            hint: e.target.value,
                          })
                        }
                        placeholder="Add a hint for students..."
                        className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12 border-2 border-dashed rounded-lg border-border/20"
              >
                <ListChecks
                  className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
                />
                <h3
                  className="text-lg font-medium mb-2 text-foreground"
                >
                  No questions yet
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Select a question type and add your first question
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {saveError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="outline"
            className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isQuizReady || formData.questions.length === 0 || isSavingQuiz}
            className={`cursor-btn-hover focus-warm transition-all duration-150 ${
              isQuizReady && formData.questions.length > 0 && !isSavingQuiz
                ? "bg-surface-300 text-foreground"
                : "bg-card text-foreground"
            }`}
            style={{
              opacity:
                isQuizReady && formData.questions.length > 0 && !isSavingQuiz ? 1 : 0.6,
              cursor:
                isQuizReady && formData.questions.length > 0 && !isSavingQuiz
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {isSavingQuiz ? "Creating..." : "Create Quiz"}
          </Button>
        </div>
      </form>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b p-6 border-border/10"
            >
              <div>
                <h2
                  className="text-xl font-normal text-foreground"
                  style={{ letterSpacing: "-0.11px" }}
                >
                  Quiz Preview
                </h2>
                <p
                  className="mt-1 text-sm text-muted-foreground"
                >
                  Review the quiz as a student would see it
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPreviewOpen(false)}
                className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-4">
                  <div
                    className="rounded-xl border p-5 bg-surface-100 border-border/10"
                  >
                    <h3
                      className="mb-2 text-2xl font-normal text-foreground"
                      style={{ letterSpacing: "-0.11px" }}
                    >
                      {formData.title || "Untitled Quiz"}
                    </h3>
                    <p
                      className="text-sm leading-6 text-muted-foreground"
                    >
                      {formData.description ||
                        "Your quiz description will appear here."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {formData.questions.length > 0 ? (
                      formData.questions.map((question, index) => (
                        <QuestionPreviewCard
                          key={question.id}
                          question={question}
                          index={index}
                        />
                      ))
                    ) : (
                      <div
                        className="rounded-xl border p-5 text-sm bg-surface-100 border-border/10 text-muted-foreground"
                      >
                        Add questions to preview the student experience.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className="rounded-xl border p-5 bg-surface-100 border-border/10"
                  >
                    <h4
                      className="mb-4 text-lg font-medium text-foreground"
                    >
                      Quiz Details
                    </h4>
                    <div
                      className="space-y-3 text-sm text-muted-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <span>Questions</span>
                        <span>{formData.questions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total points</span>
                        <span>{totalPoints}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Time limit</span>
                        <span>{formData.duration || "No limit"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Course</span>
                        <span>{formData.courseTitle || "Standalone quiz"}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl border p-5 bg-surface-100 border-border/10"
                  >
                    <h4
                      className="mb-4 text-lg font-medium text-foreground"
                    >
                      Question Mix
                    </h4>
                    <div className="space-y-2">
                      {(
                        Object.keys(questionTypeLabels) as QuestionType[]
                      ).map((type) => {
                        const count = formData.questions.filter(
                          (question) => question.type === type
                        ).length;

                        return (
                          <div
                            key={type}
                            className="flex items-center justify-between rounded-md px-3 py-2 bg-surface-300 text-foreground"
                          >
                            <span className="text-sm">{questionTypeLabels[type]}</span>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
