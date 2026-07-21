import { X } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { getLessonTypeLabel } from "./utils";

interface LessonModalHeaderProps {
  lessonType: "video" | "text" | "quiz" | "code";
  isEditing?: boolean;
  onClose: () => void;
}

export function LessonModalHeader({
  lessonType,
  isEditing = false,
  onClose,
}: LessonModalHeaderProps) {
  const lessonLabel = getLessonTypeLabel(lessonType);

  return (
    <div
      className="flex shrink-0 items-center justify-between border-b border-border/10 p-6"
    >
      <div>
        <h2
          className="text-xl font-normal text-foreground"
          style={{ letterSpacing: "-0.11px" }}
        >
          {isEditing ? "Edit" : "Add"} {lessonLabel}
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
