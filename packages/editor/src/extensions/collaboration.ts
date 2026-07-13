import Collaboration from "@tiptap/extension-collaboration";

export { Collaboration };

/**
 * Collaboration extension factory — creates a configured Collaboration
 * extension bound to the given Yjs document.
 */
export function createCollaborationExtension(doc: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Collaboration.configure({ document: doc as any });
}
