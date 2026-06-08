import { LessonFormData } from "./types";

interface VideoLessonFieldsProps {
  lessonFormData: LessonFormData;
  onUrlChange: (url: string) => void;
}

export function VideoLessonFields({
  lessonFormData,
  onUrlChange,
}: VideoLessonFieldsProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2 text-foreground"
      >
        Video URL *
      </label>
      <input
        type="url"
        value={lessonFormData.url || ""}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
        required
      />
      <p className="text-xs mt-2 text-muted-foreground">
        Paste YouTube, Vimeo, or any video hosting platform link
      </p>
    </div>
  );
}
