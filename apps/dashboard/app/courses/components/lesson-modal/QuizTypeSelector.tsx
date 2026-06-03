import {
  ArrowsLeftRight,
  Check,
  CheckSquare,
  DotsSix,
} from "@phosphor-icons/react";
import { QuizType } from "./types";

interface QuizTypeSelectorProps {
  quizType?: QuizType;
  onChange: (type: QuizType) => void;
}

const quizTypeOptions: Array<{
  type: QuizType;
  title: string;
  description: string;
  Icon: typeof DotsSix;
}> = [
  {
    type: "multiple-choice",
    title: "Multiple Choice",
    description: "One correct answer",
    Icon: DotsSix,
  },
  {
    type: "drag-drop",
    title: "Drag & Drop",
    description: "Match or order items",
    Icon: ArrowsLeftRight,
  },
  {
    type: "checkbox",
    title: "Checks",
    description: "Multiple correct answers",
    Icon: CheckSquare,
  },
  {
    type: "true-false",
    title: "True/False",
    description: "Binary questions",
    Icon: Check,
  },
];

export function QuizTypeSelector({
  quizType,
  onChange,
}: QuizTypeSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2" style={{ color: "#26251e" }}>
        Quiz Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quizTypeOptions.map(({ type, title, description, Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`p-3 rounded-lg border-2 cursor-btn-hover focus-warm transition-all duration-150 text-left ${
              quizType === type
                ? "bg-[#26251e] text-white border-[#26251e]"
                : "bg-[#f7f7f4] border-transparent"
            }`}
            style={{
              borderColor:
                quizType === type ? "#26251e" : "rgba(38, 37, 30, 0.1)",
            }}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <div>
                <div className="font-medium text-sm">{title}</div>
                <div className="text-xs opacity-75">{description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
