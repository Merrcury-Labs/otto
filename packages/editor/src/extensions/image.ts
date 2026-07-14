import Image from "@tiptap/extension-image";

export const ImageExtension = Image.configure({
  inline: false,
  allowBase64: true,
  HTMLAttributes: {
    class: "otto-image",
  },
});
