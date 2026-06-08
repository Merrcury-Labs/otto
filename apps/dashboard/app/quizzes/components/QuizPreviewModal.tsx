"use client";

import { useState } from "react";
import {
  ArrowsLeftRight,
  Brain,
  Check,
  DotsSixVertical,
  X,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import {
  questionTypeLabels,
  type QuestionType,
  type QuizFormData,
  type QuizQuestion,
} from "../types";

interface QuizPreviewModalProps {
  quiz: QuizFormData;
  isOpen: boolean;
  onClose: () => void;
}

function QuestionPreviewCard({
  question,
  index,
}: {
  question: QuizQuestion;
  index: number;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [categoryAssignments, setCategoryAssignments] = useState<
    Record<number, number>
  >({});
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
      currentItems.includes(optionIndex)
        ? currentItems
        : [...currentItems, optionIndex]
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
            Question {index + 1} • {questionTypeLabels[question.type]}
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
                className={`flex h-5 w-5 items-center justify-center rounded-full border border-foreground ${
                  selectedOption === optionIndex ? "bg-primary text-primary-foreground" : "text-foreground"
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
                  className={`flex h-5 w-5 items-center justify-center rounded border border-foreground ${
                    isSelected ? "bg-primary text-primary-foreground" : "text-foreground"
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
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const optionIndex = Number(event.dataTransfer.getData("text/plain"));
              if (!Number.isNaN(optionIndex)) returnItemToPool(optionIndex);
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
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", optionIndex.toString())
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
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const optionIndex = Number(event.dataTransfer.getData("text/plain"));
                  if (!Number.isNaN(optionIndex)) {
                    moveItemToCategory(optionIndex, categoryIndex);
                  }
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
                          className="flex items-center justify-between rounded-md px-3 py-2 bg-surface-100 text-foreground"
                        >
                          <span className="text-sm">
                            {question.options[optionIndex] ||
                              `Item ${optionIndex + 1}`}
                          </span>
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
              <DotsSixVertical className="h-4 w-4" />
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
                  className="rounded px-2 py-1 text-xs bg-surface-300 text-foreground"
                  style={{ opacity: orderIndex === 0 ? 0.5 : 1 }}
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={orderIndex === orderedItems.length - 1}
                  onClick={() => moveOrderedItem(orderIndex, orderIndex + 1)}
                  className="rounded px-2 py-1 text-xs bg-surface-300 text-foreground"
                  style={{ opacity: orderIndex === orderedItems.length - 1 ? 0.5 : 1 }}
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

export function QuizPreviewModal({
  quiz,
  isOpen,
  onClose,
}: QuizPreviewModalProps) {
  if (!isOpen) return null;

  const totalPoints = quiz.questions.reduce(
    (acc, question) => acc + question.points,
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl bg-card"
        onClick={(event) => event.stopPropagation()}
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
            onClick={onClose}
            className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
            aria-label="Close quiz preview"
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
                <div className="mb-4 flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-300"
                  >
                    <Brain className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3
                      className="mb-2 text-2xl font-normal text-foreground"
                      style={{ letterSpacing: "-0.11px" }}
                    >
                      {quiz.title || "Untitled Quiz"}
                    </h3>
                    <p
                      className="text-sm leading-6 text-muted-foreground"
                    >
                      {quiz.description || "Your quiz description will appear here."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {quiz.questions.length > 0 ? (
                  quiz.questions.map((question, index) => (
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
                    <span>{quiz.questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total points</span>
                    <span>{totalPoints}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time limit</span>
                    <span>{quiz.duration || "No limit"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Course</span>
                    <span>{quiz.courseTitle || "Standalone quiz"}</span>
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
                  {(Object.keys(questionTypeLabels) as QuestionType[]).map(
                    (type) => {
                      const count = quiz.questions.filter(
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
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
