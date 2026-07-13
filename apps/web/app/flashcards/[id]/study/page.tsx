"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  X,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { graphqlFetch } from "@/lib/graphql/client";
import {
  flashcardDeckDetailQuery,
  reviewFlashcardMutation,
} from "@/lib/graphql/flashcards";

// ─── Types ────────────────────────────────────────────────────────────────

type Flashcard = {
  id: string;
  front: string;
  back: string;
  position: number;
  hint?: string;
  tags?: string[];
};

type FlashcardDeck = {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  cards: Flashcard[];
};

type DeckDetailData = {
  flashcardDeck: FlashcardDeck;
};

type Quality = 0 | 1 | 2 | 3 | 4 | 5;

const confidenceButtons: { label: string; quality: Quality; color: string }[] = [
  { label: "Again", quality: 0, color: "bg-red-500/15 text-red-600 hover:bg-red-500/25" },
  { label: "Hard", quality: 2, color: "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25" },
  { label: "Good", quality: 4, color: "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25" },
  { label: "Easy", quality: 5, color: "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25" },
];

// ─── Component ────────────────────────────────────────────────────────────

export default function StudyPage() {
  const params = useParams();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState(0);

  // AI explanation state
  const [showExplain, setShowExplain] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [explanationState, setExplanationState] = useState<"idle" | "loading" | "streaming" | "done">("idle");

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const currentCard = cards[currentIndex] || null;
  const isComplete = currentIndex >= cards.length;

  // ─── Fetch deck ───────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchDeck() {
      try {
        const result = await graphqlFetch<DeckDetailData>({
          query: flashcardDeckDetailQuery,
          variables: { id: deckId },
        });
        const d = result.flashcardDeck;
        if (d) {
          setDeck(d);
          // Shuffle cards for study session
          const shuffled = [...(d.cards || [])].sort(() => Math.random() - 0.5);
          setCards(shuffled);
        }
      } catch (err) {
        console.error("Failed to fetch deck:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, [deckId]);

  // ─── Handle confidence rating ──────────────────────────────────────────

  const handleRate = useCallback(
    async (quality: Quality) => {
      if (!currentCard) return;

      // Submit review (fire and forget — don't block the UI)
      graphqlFetch({
        query: reviewFlashcardMutation,
        variables: {
          cardId: currentCard.id,
          studentId: "current", // TODO: get from session
          quality,
        },
      }).catch((err) => console.error("Failed to submit review:", err));

      // Move to next card
      setReviewed((prev) => prev + 1);
      setIsFlipped(false);
      setShowExplain(false);
      setExplanationText("");
      setExplanationState("idle");
      setCurrentIndex((prev) => prev + 1);
    },
    [currentCard]
  );

  // ─── AI Explain ────────────────────────────────────────────────────────

  const handleExplain = useCallback(async () => {
    if (!currentCard) return;
    setShowExplain(true);
    setExplanationState("loading");
    setExplanationText("");

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: currentCard.front,
          back: currentCard.back,
          context: deck?.courseTitle,
        }),
      });

      if (!response.ok || !response.body) {
        setExplanationText("Unable to generate explanation. Please try again.");
        setExplanationState("done");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setExplanationState("streaming");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse Vercel AI SDK data stream format (lines starting with "0:")
        const textChunk = chunk
          .split("\n")
          .filter((line) => line.startsWith("0:"))
          .map((line) => line.slice(2))
          .map((s) => {
            try {
              return JSON.parse(s);
            } catch {
              return s;
            }
          })
          .join("");

        if (textChunk) {
          setExplanationText((prev) => prev + textChunk);
        }
      }

      setExplanationState("done");
    } catch {
      setExplanationText("Failed to get explanation. Please try again.");
      setExplanationState("done");
    }
  }, [currentCard, deck?.courseTitle]);

  // ─── Touch/swipe gestures ──────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Only handle horizontal swipes
      if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (isFlipped) {
        // While flipped: swipe right = Good, swipe left = Again
        handleRate(deltaX > 0 ? 4 : 0);
      } else {
        // While on front: any swipe = flip
        setIsFlipped(true);
      }
    },
    [isFlipped, handleRate]
  );

  // ─── Render ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading deck...</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">Deck not found</p>
        <a href="/flashcards" className="text-sm text-primary hover:underline">
          Back to Flash Cards
        </a>
      </div>
    );
  }

  // ─── Session Complete ──────────────────────────────────────────────────

  if (isComplete) {
    return (
      <div className="flex h-svh flex-col items-center justify-center gap-6 px-6">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <Sparkles className="size-8 text-emerald-500" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Session Complete!
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            You reviewed {reviewed} card{reviewed !== 1 ? "s" : ""} from &ldquo;{deck.title}&rdquo;
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/flashcards/${deckId}/study`}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Study Again
          </a>
          <a
            href="/flashcards"
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
          >
            All Decks
          </a>
        </div>
      </div>
    );
  }

  // ─── Study Card ────────────────────────────────────────────────────────

  if (!currentCard) {
    return (
      <div className="flex h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">No card available</p>
      </div>
    );
  }

  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  return (
    <div className="flex h-svh flex-col bg-background">
      {/* Progress bar */}
      <div className="h-1 w-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <a href="/flashcards" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span className="text-xs font-medium">Exit</span>
        </a>
        <div className="text-center">
          <p className="text-xs font-semibold truncate max-w-[200px]">{deck.title}</p>
          <p className="text-[10px] text-muted-foreground">
            {currentIndex + 1} of {cards.length}
          </p>
        </div>
        <button
          onClick={() => {
            setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
            setCurrentIndex(0);
            setReviewed(0);
            setIsFlipped(false);
          }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="size-3.5" />
          <span className="text-xs font-medium">Shuffle</span>
        </button>
      </div>

      {/* Card area */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div
          className="w-full max-w-lg"
          style={{ perspective: "1200px" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="relative w-full transition-transform duration-600 ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transitionDuration: "600ms",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {/* Front */}
            <div
              className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center cursor-pointer select-none"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                {currentCard.tags && currentCard.tags.length > 0 && (
                  <div className="flex gap-1.5 mb-4">
                    {currentCard.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-lg font-semibold leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
                  {currentCard.front}
                </p>
              </div>
              {currentCard.hint && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-4">
                  <Lightbulb className="size-3" />
                  <span>{currentCard.hint}</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground/50 mt-4">
                Tap to reveal answer
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex min-h-[340px] flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-sm text-muted-foreground/60 mb-3">Answer</p>
              <p className="text-lg leading-relaxed">{currentCard.back}</p>

              {/* Explain button */}
              {!showExplain && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExplain();
                  }}
                  className="mt-6 flex items-center gap-2 rounded-xl ai-gradient px-4 py-2 text-xs font-semibold text-white ai-glow transition-all hover:opacity-90"
                >
                  <Sparkles className="size-3.5" />
                  Explain
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Panel */}
      {showExplain && (
        <div className="border-t frosted">
          <div className="mx-auto max-w-lg px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-violet-500/10">
                  <Sparkles className="size-3 text-violet-500" />
                </div>
                <span className="text-xs font-semibold">AI Explanation</span>
                {explanationState === "loading" && (
                  <span className="text-[10px] text-muted-foreground">Thinking...</span>
                )}
                {explanationState === "streaming" && (
                  <span className="text-[10px] text-muted-foreground animate-pulse">Writing...</span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowExplain(false);
                  setExplanationText("");
                  setExplanationState("idle");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap min-h-[40px]">
              {explanationText || (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="size-1.5 animate-pulse rounded-full bg-violet-500/60" />
                  <div className="size-1.5 animate-pulse rounded-full bg-violet-500/60" style={{ animationDelay: "300ms" }} />
                  <div className="size-1.5 animate-pulse rounded-full bg-violet-500/60" style={{ animationDelay: "600ms" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confidence buttons (only when flipped) */}
      {isFlipped && (
        <div className="border-t px-5 py-4">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-2">
              Rate:
            </p>
            {confidenceButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleRate(btn.quality)}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${btn.color}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
            Swipe ← Again · Swipe → Good
          </p>
        </div>
      )}
    </div>
  );
}
