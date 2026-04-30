import { Check, Plus } from "@phosphor-icons/react";
import { QuizQuestion, QuizType } from "./types";
import { getQuizTypeLabel } from "./utils";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizTypeSelector } from "./QuizTypeSelector";

interface QuizLessonFieldsProps {
  questions: QuizQuestion[];
  quizType?: QuizType;
  onAddQuestion: () => void;
  onUpdateQuestion: (questionId: number, updates: Partial<QuizQuestion>) => void;
  onRemoveQuestion: (questionId: number) => void;
  onUpdateQuizType: (type: QuizType) => void;
}

export function QuizLessonFields({
  questions,
  quizType,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onUpdateQuizType,
}: QuizLessonFieldsProps) {
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" style={{ color: "#26251e" }}>
            Questions ({questions.length})
          </label>
          <button
            type="button"
            onClick={onAddQuestion}
            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
            style={{
              backgroundColor: "#e6e5e0",
              color: "#26251e",
            }}
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <QuizQuestionCard
                key={question.id}
                question={question}
                index={index}
                onUpdate={onUpdateQuestion}
                onRemove={onRemoveQuestion}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-8 border-2 border-dashed rounded-lg"
            style={{ borderColor: "rgba(38, 37, 30, 0.2)" }}
          >
            <Check
              className="h-8 w-8 mx-auto mb-2"
              style={{ color: "rgba(38, 37, 30, 0.4)" }}
            />
            <div
              className="text-sm font-medium mb-1"
              style={{ color: "#26251e" }}
            >
              No questions yet
            </div>
            <div
              className="text-xs"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            >
              Click "Add Question" to create your first {getQuizTypeLabel(quizType)} question
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <QuizTypeSelector quizType={quizType} onChange={onUpdateQuizType} />
      </div>
    </>
  );
}
