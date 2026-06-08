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
      className="flex items-center justify-between p-6 border-b border-border/10"
    >
      <div>
        <h2
          className="text-xl font-normal text-foreground"
          style={{ letterSpacing: "-0.11px" }}
        >
          Add {lessonLabel}
        </h2>
        <p className="text-sm mt-1 text-muted-foreground">
          {lessonLabel.toLowerCase()} details
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={onClose}
        className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}
