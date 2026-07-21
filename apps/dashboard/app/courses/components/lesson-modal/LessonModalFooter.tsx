import { Button } from "@repo/ui/button";
import { getLessonTypeLabel } from "./utils";

interface LessonModalFooterProps {
  lessonType: "video" | "text" | "quiz" | "code";
  onClose: () => void;
  onSave: () => void;
}

export function LessonModalFooter({
  lessonType,
  onClose,
  onSave,
}: LessonModalFooterProps) {
  return (
    <div className="flex shrink-0 justify-end gap-3 border-t border-border/10 p-6">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSave}
        className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
      >
        {getLessonTypeLabel(lessonType)}
      </Button>
    </div>
  );
}
