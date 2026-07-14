"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  X,
  BookOpen,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Brain,
  GraduationCap,
  ChevronDown,
  Paperclip,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────

type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLiked?: boolean | null;
};

type AITutorPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle?: string;
  courseTitle?: string;
};

// ─── Suggested Prompts ────────────────────────────────────────────────

const suggestedPrompts = [
  {
    icon: Lightbulb,
    label: "Explain this simply",
    description: "Break down the concept in plain language",
    prompt: "Can you explain this concept in simpler terms?",
    color: "text-amber-500",
    bg: "bg-amber-500/8",
  },
  {
    icon: BookOpen,
    label: "Give me an example",
    description: "Practical real-world application",
    prompt: "Can you give me a practical example of this?",
    color: "text-blue-500",
    bg: "bg-blue-500/8",
  },
  {
    icon: Brain,
    label: "Test my knowledge",
    description: "Interactive quiz to check understanding",
    prompt: "Quiz me on what I just learned to test my understanding.",
    color: "text-violet-500",
    bg: "bg-violet-500/8",
  },
  {
    icon: GraduationCap,
    label: "What should I study next?",
    description: "Personalized learning recommendations",
    prompt: "Based on this lesson, what should I focus on learning next?",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8",
  },
];

// ─── AI Tutor Panel ───────────────────────────────────────────────────

export function AITutorPanel({
  isOpen,
  onClose,
  lessonTitle,
  courseTitle,
}: AITutorPanelProps) {
  const [messages, setMessages] = React.useState<AIMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const messageEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when panel opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Track scroll position for "scroll to bottom" button
  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: AIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response with realistic delay
    setTimeout(() => {
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: generateAIResponse(messageText, lessonTitle),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleLike = (messageId: string, liked: boolean) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, isLiked: liked } : m
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div
      className={`flex h-full shrink-0 flex-col border-l bg-background ${
        isExpanded ? "w-[480px]" : "w-[380px]"
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Sparkles className="size-4 text-violet-500" />
            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold tracking-tight">
              AI Tutor
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {lessonTitle
                ? `Studying: ${lessonTitle.slice(0, 30)}${lessonTitle.length > 30 ? "…" : ""}`
                : "Ask me anything"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={clearChat}
            title="New chat"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Context bar */}
      {courseTitle && (
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1">
            <BookOpen className="size-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground line-clamp-1">
              {courseTitle}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-warm relative flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 px-2">
            {/* Welcome state */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/10">
                  <Sparkles className="size-7 text-violet-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-background">
                  <Brain className="size-3 text-violet-500" />
                </div>
              </div>
              <div className="text-center">
                <h4 className="text-[15px] font-semibold tracking-tight">
                  Your AI learning companion
                </h4>
                <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
                  Ask questions, get explanations, test your knowledge, or
                  explore topics deeper.
                </p>
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="flex w-full flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Try asking
              </p>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleSend(prompt.prompt)}
                  className="group flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
                >
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${prompt.bg}`}
                  >
                    <prompt.icon className={`size-3.5 ${prompt.color}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[13px] font-medium">
                      {prompt.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {prompt.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-1.5 animate-in fade-in slide-up duration-300 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-5 items-center justify-center rounded-md bg-violet-500/10">
                      <Sparkles className="size-2.5 text-violet-500" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      AI Tutor
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-[13px] leading-[1.65] ${
                    message.role === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-card border rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.role === "assistant" && (
                  <div className="flex items-center gap-0.5 ml-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ opacity: 1 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground/50 hover:text-foreground"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-6 ${
                        message.isLiked === true
                          ? "text-emerald-500"
                          : "text-muted-foreground/50 hover:text-foreground"
                      }`}
                      onClick={() => handleLike(message.id, true)}
                    >
                      <ThumbsUp className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`size-6 ${
                        message.isLiked === false
                          ? "text-red-500"
                          : "text-muted-foreground/50 hover:text-foreground"
                      }`}
                      onClick={() => handleLike(message.id, false)}
                    >
                      <ThumbsDown className="size-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col gap-1.5 items-start animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <div className="flex size-5 items-center justify-center rounded-md bg-violet-500/10">
                    <Sparkles className="size-2.5 text-violet-500" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    AI Tutor
                  </span>
                </div>
                <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div
                      className="size-1.5 animate-pulse-soft rounded-full bg-violet-500/60"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="size-1.5 animate-pulse-soft rounded-full bg-violet-500/60"
                      style={{ animationDelay: "300ms" }}
                    />
                    <div
                      className="size-1.5 animate-pulse-soft rounded-full bg-violet-500/60"
                      style={{ animationDelay: "600ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex size-8 items-center justify-center rounded-full border bg-background shadow-md transition-opacity hover:bg-secondary"
          >
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2 rounded-xl border bg-card px-3 py-2 focus-within:border-violet-500/30 focus-within:ring-1 focus-within:ring-violet-500/10 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this lesson…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
          />
          <Button
            size="icon"
            className="size-7 shrink-0 rounded-lg bg-violet-500 hover:bg-violet-600 text-white"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
          AI may produce inaccurate information. Verify important facts.
        </p>
      </div>
    </div>
  );
}

// ─── Simulated AI Response Generator ──────────────────────────────────

function generateAIResponse(
  userMessage: string,
  lessonTitle?: string
): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("explain") || lowerMessage.includes("simpler") || lowerMessage.includes("simple")) {
    return `Great question! Let me break this down for you.

The key idea here is that this concept works by organizing related functionality together. Think of it like a filing cabinet — each drawer holds related documents, making it easier to find what you need.

The three main takeaways are:

1. **Organization** — Grouping related items reduces complexity
2. **Reusability** — Well-organized pieces can be used in multiple contexts
3. **Maintainability** — Changes to one area don't ripple across everything

Would you like me to go deeper into any of these points?`;
  }

  if (lowerMessage.includes("example") || lowerMessage.includes("practical")) {
    return `Here's a practical example:

Imagine you're building a weather app. Instead of mixing all your data fetching, UI rendering, and state management in one file, you'd organize it like this:

• **Data Layer** — Fetches weather from the API
• **Logic Layer** — Processes the data (converts units, etc.)
• **UI Layer** — Displays the weather information

This separation makes each part easier to test, update, and reuse.

Want me to walk through how this applies to your current lesson?`;
  }

  if (lowerMessage.includes("quiz") || lowerMessage.includes("test") || lowerMessage.includes("understand") || lowerMessage.includes("knowledge")) {
    return `Let's test your understanding! Try answering these:

**Q1:** What is the primary benefit of separating concerns in your code?
a) Faster runtime performance
b) Better organization and maintainability
c) Smaller file sizes

**Q2:** Which layer would handle converting temperature from Kelvin to Celsius?
a) Data Layer
b) Logic Layer
c) UI Layer

Think about your answers and I'll let you know if you're on the right track! 🎯`;
  }

  if (lowerMessage.includes("next") || lowerMessage.includes("recommend") || lowerMessage.includes("study")) {
    return `Based on what you've covered so far, here's what I'd recommend focusing on next:

1. **Deepen your understanding** — The current topic connects to several advanced patterns. Make sure you're comfortable with the fundamentals first.

2. **Practice exercises** — Try building a small project that uses these concepts. Hands-on practice solidifies understanding better than re-reading.

3. **Related topics** — You might find these areas particularly relevant:
   • Design patterns that build on this concept
   • Testing strategies for organized code
   • Performance implications of different approaches

Would you like me to suggest specific exercises or explain any of these topics?`;
  }

  return `That's a thoughtful question about "${lessonTitle || "this topic"}"!

The core concept here involves understanding how different parts of a system interact with each other. When you grasp these relationships, the individual pieces start to make much more sense.

Here's what I'd suggest:
1. Focus on the **"why"** behind each concept, not just the "how"
2. Try connecting this to something you already know
3. Practice by explaining it to someone else (or to me!)

Would you like me to elaborate on any specific aspect?`;
}
