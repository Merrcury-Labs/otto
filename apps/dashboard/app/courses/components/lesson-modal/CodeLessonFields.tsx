import { LessonFormData } from "./types";

interface CodeLessonFieldsProps {
  lessonFormData: LessonFormData;
  onContentChange: (content: string) => void;
}

export function CodeLessonFields({
  lessonFormData,
  onContentChange,
}: CodeLessonFieldsProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2 text-foreground"
      >
        Exercise Instructions
      </label>
      <textarea
        value={lessonFormData.content || ""}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Enter exercise instructions or paste GitHub repository URL..."
        rows={8}
        className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none font-mono text-sm bg-surface-100 border border-border/10 text-foreground"
      />
    </div>
  );
}
