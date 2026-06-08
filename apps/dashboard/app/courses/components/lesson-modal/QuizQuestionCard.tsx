import { ArrowsLeftRight, Check, Trash, X } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { QuizQuestion } from "./types";

interface QuizQuestionCardProps {
  question: QuizQuestion;
  index: number;
  onUpdate: (questionId: number, updates: Partial<QuizQuestion>) => void;
  onRemove: (questionId: number) => void;
}

function QuestionHeader({
  question,
  index,
  onUpdate,
  onRemove,
}: QuizQuestionCardProps) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div
          className="text-xs font-medium mb-1 text-muted-foreground"
        >
          Question {index + 1}
        </div>
        <input
          type="text"
          value={question.question}
          onChange={(e) =>
            onUpdate(question.id, {
              question: e.target.value,
            })
          }
          placeholder="Enter your question..."
          className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onRemove(question.id)}
        className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

function HintField({
  question,
  onUpdate,
}: Pick<QuizQuestionCardProps, "question" | "onUpdate">) {
  return (
    <div>
      <div
        className="text-xs font-medium mb-1 text-muted-foreground"
      >
        Hint (Optional)
      </div>
      <input
        type="text"
        value={question.hint || ""}
        onChange={(e) =>
          onUpdate(question.id, {
            hint: e.target.value,
          })
        }
        placeholder="Add a hint for students..."
        className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
      />
    </div>
  );
}

function MultipleChoiceQuestion(props: QuizQuestionCardProps) {
  const { question, onUpdate } = props;

  return (
    <>
      <QuestionHeader {...props} />

      <div className="space-y-2 mb-3">
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
                onUpdate(question.id, {
                  correctAnswer: optionIndex,
                })
              }
              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                question.correctAnswer === optionIndex
                  ? "bg-primary text-primary-foreground border-primary"
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
                onUpdate(question.id, {
                  options: newOptions,
                });
              }}
              placeholder={`Option ${optionIndex + 1}`}
              className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
            />
          </div>
        ))}
      </div>

      <HintField question={question} onUpdate={onUpdate} />
    </>
  );
}

function DragDropQuestion(props: QuizQuestionCardProps) {
  const { question, onUpdate } = props;

  return (
    <>
      <QuestionHeader {...props} />

      <div className="mb-3">
        <div
          className="text-xs font-medium mb-2 text-muted-foreground"
        >
          Items to Match/Order
        </div>
        <div className="space-y-2">
          {question.options.map((option, optionIndex) => (
            <div
              key={optionIndex}
              className={`p-3 rounded-md cursor-move ${
                question.correctItems?.includes(optionIndex)
                  ? "bg-surface-300 border-foreground"
                  : "bg-card border-border/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <ArrowsLeftRight className="h-4 w-4" />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[optionIndex] = e.target.value;
                    onUpdate(question.id, {
                      options: newOptions,
                    });
                  }}
                  placeholder={`Item ${optionIndex + 1}`}
                  className="flex-1 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 border border-border/10 text-foreground"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <HintField question={question} onUpdate={onUpdate} />
    </>
  );
}

function CheckboxQuestion(props: QuizQuestionCardProps) {
  const { question, onUpdate } = props;

  return (
    <>
      <QuestionHeader {...props} />

      <div className="space-y-2 mb-3">
        <div
          className="text-xs font-medium text-muted-foreground"
        >
          Answer Options (Select all correct)
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

                onUpdate(question.id, {
                  correctAnswer: newCorrect,
                });
              }}
              className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                Array.isArray(question.correctAnswer) &&
                question.correctAnswer.includes(optionIndex)
                  ? "bg-primary text-primary-foreground border-primary"
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
                onUpdate(question.id, {
                  options: newOptions,
                });
              }}
              placeholder={`Option ${optionIndex + 1}`}
              className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
            />
          </div>
        ))}
      </div>

      <HintField question={question} onUpdate={onUpdate} />
    </>
  );
}

function TrueFalseQuestion(props: QuizQuestionCardProps) {
  const { question, onUpdate } = props;

  return (
    <>
      <QuestionHeader {...props} />

      <div className="mb-3">
        <div
          className="text-xs font-medium mb-2 text-muted-foreground"
        >
          Correct Answer
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              onUpdate(question.id, {
                answer: "True",
              })
            }
            className={`flex-1 p-4 rounded-lg cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
              question.answer === "True"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border/20"
            }`}
          >
            <Check className="h-4 w-4 mr-2" />
            True
          </button>
          <button
            type="button"
            onClick={() =>
              onUpdate(question.id, {
                answer: "False",
              })
            }
            className={`flex-1 p-4 rounded-lg cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
              question.answer === "False"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border/20"
            }`}
          >
            <X className="h-4 w-4 mr-2" />
            False
          </button>
        </div>
      </div>

      <HintField question={question} onUpdate={onUpdate} />
    </>
  );
}

export function QuizQuestionCard(props: QuizQuestionCardProps) {
  const { question } = props;

  return (
    <div
      className="border rounded-lg p-4 bg-surface-100 border-border/10"
    >
      {question.type === "multiple-choice" && (
        <MultipleChoiceQuestion {...props} />
      )}
      {question.type === "drag-drop" && <DragDropQuestion {...props} />}
      {question.type === "checkbox" && <CheckboxQuestion {...props} />}
      {question.type === "true-false" && <TrueFalseQuestion {...props} />}
    </div>
  );
}
