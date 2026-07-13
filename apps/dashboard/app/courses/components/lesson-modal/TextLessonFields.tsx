"use client";

import { OttoEditor } from "@repo/editor";
import { LessonFormData } from "./types";

interface TextLessonFieldsProps {
  lessonFormData: LessonFormData;
  onContentChange: (content: string) => void;
  lessonId?: string;
}

export function TextLessonFields({
  lessonFormData,
  onContentChange,
  lessonId,
}: TextLessonFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          Reading Content
        </label>
      </div>

      <OttoEditor
        content={lessonFormData.content || ""}
        onChange={onContentChange}
        placeholder="Write your reading content...

Use the toolbar to add headings, bold, italic, links, code, quotes, and lists."
        showToolbar
        showWordCount
        minHeight="200px"
        documentId={lessonId ? `lesson-${lessonId}` : undefined}
        format="auto"
      />
    </div>
  );
}
