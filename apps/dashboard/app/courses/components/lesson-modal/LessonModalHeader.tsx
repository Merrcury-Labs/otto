import { X } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { getLessonTypeLabel } from "./utils";

interface LessonModalHeaderProps {
  lessonType: "video" | "text" | "quiz" | "code";
  onClose: () => void;
}

export function LessonModalHeader({
  lessonType,
  onClose,
}: LessonModalHeaderProps) {
  const lessonLabel = getLessonTypeLabel(lessonType);

  return (
    <div
      className="flex items-center justify-between p-6 border-b"
      style={{ borderColor: "rgba(38, 37, 30, 0.1)" }}
    >
      <div>
        <h2
          className="text-xl font-normal"
          style={{ color: "#26251e", letterSpacing: "-0.11px" }}
        >
          Add {lessonLabel}
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
          {lessonLabel.toLowerCase()} details
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={onClose}
        className="cursor-btn-hover focus-warm transition-all duration-150"
        style={{ color: "#26251e" }}
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
