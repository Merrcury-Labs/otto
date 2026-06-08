import { LessonFormData } from "./types";

interface LessonDetailsFieldsProps {
  lessonFormData: LessonFormData;
  onDurationChange: (duration: string) => void;
}

export function LessonDetailsFields({
  lessonFormData,
  onDurationChange,
}: LessonDetailsFieldsProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2 text-foreground"
      >
        Lesson Length
      </label>
      <input
        type="text"
        value={lessonFormData.duration}
        onChange={(e) => onDurationChange(e.target.value)}
        placeholder="e.g. 15 min"
        className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
      />
      <p className="text-xs mt-2 text-muted-foreground">
        Add the estimated time a student will spend on this lesson.
      </p>
    </div>
  );
}
