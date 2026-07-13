export type ContentFormat = "prosemirror" | "markdown" | "auto";

export type EditorVariant = "default" | "tiptap" | "gdocs";

export interface EditorUser {
  name: string;
  color: string;
}

export interface OttoEditorProps {
  /** ProseMirror JSON string or legacy markdown */
  content: string;
  /** Callback with ProseMirror JSON (required in editable mode) */
  onChange?: (json: string) => void;
  /** Contextual placeholder text */
  placeholder?: string;
  /** Read-only mode for preview */
  editable?: boolean;
  /** Show/hide toolbar */
  showToolbar?: boolean;
  /** Show word count footer */
  showWordCount?: boolean;
  /** Min editor height */
  minHeight?: string;
  /** Enable Yjs collaboration mode */
  collaborative?: boolean;
  /** Yjs document identifier (e.g., "lesson-{uuid}") */
  documentId?: string;
  /** User identity for collaboration cursor */
  user?: EditorUser;
  /** Enable AI features */
  aiEnabled?: boolean;
  /** Content format hint */
  format?: ContentFormat;
  /** Editor variant: "default" = bordered with fixed toolbar, "tiptap" = chromeless with bubble toolbar */
  variant?: EditorVariant;
  /** Additional CSS class for the editor wrapper */
  className?: string;
}

export interface ToolbarAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
  separator?: boolean;
}
