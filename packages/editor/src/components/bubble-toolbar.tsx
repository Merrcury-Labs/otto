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
  TextStrikethrough,
} from "@phosphor-icons/react";
import { cn } from "../lib/utils";

interface BubbleToolbarProps {
  editor: Editor;
}

interface BubbleButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  isActive?: boolean;
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const buttons: BubbleButton[] = [
    {
      icon: <TextB className="h-3.5 w-3.5" />,
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      icon: <TextItalic className="h-3.5 w-3.5" />,
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      icon: <TextStrikethrough className="h-3.5 w-3.5" />,
      label: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      icon: <Code className="h-3.5 w-3.5" />,
      label: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    {
      icon: <TextH className="h-3.5 w-3.5" />,
      label: "Heading",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <ListBullets className="h-3.5 w-3.5" />,
      label: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      icon: <ListNumbers className="h-3.5 w-3.5" />,
      label: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      icon: <Quotes className="h-3.5 w-3.5" />,
      label: "Quote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    {
      icon: <Link className="h-3.5 w-3.5" />,
      label: "Link",
      action: () => {
        if (editor.isActive("link")) {
          editor.chain().focus().unsetLink().run();
        } else {
          const url = window.prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: editor.isActive("link"),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-foreground px-1 py-0.5 shadow-lg">
      {buttons.map((btn, i) => (
        <button
          key={btn.label}
          type="button"
          onClick={btn.action}
          title={btn.label}
          className={cn(
            "rounded p-1.5 transition-colors",
            btn.isActive
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}
