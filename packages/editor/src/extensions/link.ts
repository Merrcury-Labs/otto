import Link from "@tiptap/extension-link";

export const LinkExtension = Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: "otto-link",
    rel: "noopener noreferrer",
    target: "_blank",
  },
});
