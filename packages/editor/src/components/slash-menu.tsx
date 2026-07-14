"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "../lib/utils";

interface SlashMenuItem {
  label: string;
  description: string;
  command: string;
}

const SLASH_COMMANDS: SlashMenuItem[] = [
  { label: "Write", description: "Generate text from a prompt", command: "write" },
  { label: "Continue", description: "Continue writing from cursor", command: "continue" },
  { label: "Summarize", description: "Summarize selected text", command: "summarize" },
  { label: "Expand", description: "Expand with more detail", command: "expand" },
  { label: "Simplify", description: "Simplify the text", command: "simplify" },
  { label: "Rewrite", description: "Rewrite for clarity", command: "rewrite" },
  { label: "Fix Grammar", description: "Fix grammar and spelling", command: "fix-grammar" },
];

interface SlashMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (command: string) => void;
  position: { top: number; left: number };
}

export function SlashMenu({ isOpen, onClose, onSelect, position }: SlashMenuProps) {
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
      cmd.command.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setFilter("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].command);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, selectedIndex, onSelect, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-50 w-72 rounded-lg border border-border/10 bg-card shadow-lg",
        "p-1 text-sm"
      )}
      style={{ top: position.top, left: position.left }}
    >
      {/* Filter input */}
      <div className="px-2 py-1.5 border-b border-border/10">
        <input
          ref={inputRef}
          type="text"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search commands..."
          className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />
      </div>

      {/* Command list */}
      <div className="max-h-64 overflow-y-auto py-1">
        {filtered.length === 0 ? (
          <div className="px-3 py-2 text-muted-foreground text-xs">
            No matching commands
          </div>
        ) : (
          filtered.map((cmd, index) => (
            <button
              key={cmd.command}
              type="button"
              onClick={() => onSelect(cmd.command)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md cursor-btn-hover transition-all duration-150",
                index === selectedIndex
                  ? "bg-surface-300 text-foreground"
                  : "text-foreground"
              )}
            >
              <div className="font-medium">{cmd.label}</div>
              <div className="text-xs text-muted-foreground">{cmd.description}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export { SLASH_COMMANDS };
