import Placeholder from "@tiptap/extension-placeholder";

export const PlaceholderExtension = Placeholder.configure({
  showOnlyCurrent: false,
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`;
    }
    return "Start writing…";
  },
});
