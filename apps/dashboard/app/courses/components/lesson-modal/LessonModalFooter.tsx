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
    <div className="flex justify-end gap-3 p-6">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="cursor-btn-hover focus-warm transition-all duration-150"
        style={{
          backgroundColor: "#f7f7f4",
          borderColor: "rgba(38, 37, 30, 0.1)",
          color: "#26251e",
        }}
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSave}
        className="cursor-btn-hover focus-warm transition-all duration-150"
        style={{
          backgroundColor: "#ebeae5",
          color: "#26251e",
        }}
      >
        {getLessonTypeLabel(lessonType)}
      </Button>
    </div>
  );
}
