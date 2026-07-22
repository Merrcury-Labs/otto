import { mergeAttributes, Node } from "@tiptap/core";
import katex from "katex";

type MathKind = "inline" | "block";

function renderMath(dom: HTMLElement, latex: string, displayMode: boolean) {
  dom.replaceChildren();

  try {
    katex.render(latex, dom, {
      displayMode,
      throwOnError: false,
      strict: "warn",
    });
    dom.classList.remove("otto-math-error");
  } catch {
    dom.textContent = latex;
    dom.classList.add("otto-math-error");
  }
}

function createMathNode(kind: MathKind) {
  const isInline = kind === "inline";
  const name = isInline ? "inlineMath" : "blockMath";
  const tag = isInline ? "span" : "div";

  return Node.create({
    name,
    group: isInline ? "inline" : "block",
    inline: isInline,
    atom: true,
    selectable: true,

    addAttributes() {
      return {
        latex: {
          default: "",
          parseHTML: (element) => element.getAttribute("data-latex") ?? "",
        },
      };
    },

    parseHTML() {
      return [{ tag: `${tag}[data-type="${name}"]` }];
    },

    renderHTML({ HTMLAttributes }) {
      return [
        tag,
        mergeAttributes(HTMLAttributes, {
          "data-type": name,
          "data-latex": HTMLAttributes.latex,
          class: `otto-math otto-math-${kind}`,
        }),
      ];
    },

    addNodeView() {
      return ({ node, editor, getPos }) => {
        const dom = document.createElement(tag);
        dom.className = `otto-math otto-math-${kind}`;
        dom.dataset.type = name;
        dom.dataset.latex = node.attrs.latex;
        dom.title = editor.isEditable ? "Click to edit equation" : node.attrs.latex;
        renderMath(dom, node.attrs.latex, !isInline);

        const edit = () => {
          if (!editor.isEditable) return;
          const latex = window.prompt("Enter LaTeX equation:", node.attrs.latex);
          if (latex === null || !latex.trim()) return;

          const pos = getPos();
          if (typeof pos !== "number") return;
          editor.view.dispatch(
            editor.state.tr.setNodeMarkup(pos, undefined, { latex: latex.trim() }),
          );
        };

        dom.addEventListener("click", edit);

        return {
          dom,
          update(updatedNode) {
            if (updatedNode.type.name !== name) return false;
            node = updatedNode;
            dom.dataset.latex = node.attrs.latex;
            dom.title = editor.isEditable
              ? "Click to edit equation"
              : node.attrs.latex;
            renderMath(dom, node.attrs.latex, !isInline);
            return true;
          },
          destroy() {
            dom.removeEventListener("click", edit);
          },
        };
      };
    },
  });
}

export const InlineMath = createMathNode("inline");
export const BlockMath = createMathNode("block");
