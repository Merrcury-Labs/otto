import CollaborationCursor from "@tiptap/extension-collaboration-cursor";

export { CollaborationCursor };

/**
 * CollaborationCursor extension factory — creates a configured cursor
 * extension bound to the given Yjs provider's awareness.
 */
export function createCollaborationCursorExtension(
  provider: unknown,
  user: { name: string; color: string }
) {
  return CollaborationCursor.configure({
    provider: provider as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    user,
  });
}
