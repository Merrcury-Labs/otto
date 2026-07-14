"use client";

import { type Editor } from "@tiptap/react";
import {
  TextB,
  TextItalic,
  TextH,
  Code,
  ListBullets,
  ListNumbers,
  Quotes,
  Link,
  Image,
  ArrowLineLeft,
} from "@phosphor-icons/react";
import { cn } from "./lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
  className?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

interface ToolbarDivider {
  type: "divider";
}

type ToolbarItem = ToolbarButton | ToolbarDivider;

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  if (!editor) return null;

  const items: ToolbarItem[] = [
    {
      icon: <TextB className="h-4 w-4" />,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <TextItalic className="h-4 w-4" />,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    { type: "divider" },
    {
      icon: <TextH className="h-4 w-4" />,
      label: "Heading",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: "Inline Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    {
      icon: <Code className="h-4 w-4" weight="bold" />,
      label: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
    },
    { type: "divider" },
    {
      icon: <ListBullets className="h-4 w-4" />,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListNumbers className="h-4 w-4" />,
      label: "Numbered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    { type: "divider" },
    {
      icon: <Quotes className="h-4 w-4" />,
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: <Link className="h-4 w-4" />,
      label: "Link",
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive("link"),
    },
    {
      icon: <Image className="h-4 w-4" />,
      label: "Image",
      action: () => {
        const url = window.prompt("Enter image URL:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
    { type: "divider" },
    {
      icon: <ArrowLineLeft className="h-4 w-4" />,
      label: "Horizontal Rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 p-2 rounded-md bg-surface-100 border border-border/10",
        className
      )}
    >
      {items.map((item, index) => {
        if ("type" in item && item.type === "divider") {
          return (
            <div key={`divider-${index}`} className="w-px h-5 bg-border/20" />
          );
        }

        const button = item as ToolbarButton;
        return (
          <button
            key={button.label}
            type="button"
            onClick={button.action}
            disabled={button.disabled}
            title={button.label}
            className={cn(
              "p-2 rounded cursor-btn-hover focus-warm transition-all duration-150",
              button.isActive
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground",
              button.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {button.icon}
          </button>
        );
      })}
    </div>
  );
}
