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
        className="block text-sm font-medium mb-2"
        style={{ color: "#26251e" }}
      >
        Video URL *
      </label>
      <input
        type="url"
        value={lessonFormData.url || ""}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
        style={{
          backgroundColor: "#f7f7f4",
          borderColor: "rgba(38, 37, 30, 0.1)",
          color: "#26251e",
        }}
        required
      />
      <p className="text-xs mt-2" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
        Paste YouTube, Vimeo, or any video hosting platform link
      </p>
    </div>
  );
}
