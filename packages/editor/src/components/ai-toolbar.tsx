"use client";

import { type Editor } from "@tiptap/react";
import {
  PencilSimple,
  Article,
  ArrowsOut,
  Subtract,
  CheckCircle,
} from "@phosphor-icons/react";
import { cn } from "../lib/utils";

interface AIToolbarProps {
  editor: Editor;
  position: { top: number; left: number };
  onAction: (action: string) => void;
  isProcessing?: boolean;
}

interface AIAction {
  label: string;
  icon: React.ReactNode;
  action: string;
}

const AI_ACTIONS: AIAction[] = [
  { label: "Rewrite", icon: <PencilSimple className="h-3.5 w-3.5" />, action: "rewrite" },
  { label: "Summarize", icon: <Article className="h-3.5 w-3.5" />, action: "summarize" },
  { label: "Expand", icon: <ArrowsOut className="h-3.5 w-3.5" />, action: "expand" },
  { label: "Simplify", icon: <Subtract className="h-3.5 w-3.5" />, action: "simplify" },
  { label: "Fix Grammar", icon: <CheckCircle className="h-3.5 w-3.5" />, action: "fix-grammar" },
];

export function AIToolbar({
  position,
  onAction,
  isProcessing = false,
}: AIToolbarProps) {
  return (
    <div
      className={cn(
        "fixed z-50 flex items-center gap-0.5 rounded-lg border border-border/10 bg-card shadow-lg",
        "p-1"
      )}
      style={{ top: position.top, left: position.left }}
    >
      <span className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        AI
      </span>
      <div className="w-px h-5 bg-border/20" />
      {AI_ACTIONS.map((action) => (
        <button
          key={action.action}
          type="button"
          onClick={() => onAction(action.action)}
          disabled={isProcessing}
          title={action.label}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-xs",
            "cursor-btn-hover focus-warm transition-all duration-150",
            "text-foreground hover:bg-surface-300",
            isProcessing && "opacity-40 cursor-not-allowed"
          )}
        >
          {action.icon}
          <span className="hidden sm:inline">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
