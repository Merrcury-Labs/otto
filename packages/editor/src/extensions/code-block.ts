import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export const CodeBlock = CodeBlockLowlight.configure({
  lowlight,
  HTMLAttributes: {
    class: "otto-code-block",
  },
});
