"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Brain,
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  Clock,
  Flame,
  Plus,
  Settings2,
} from "lucide-react";
import { graphqlFetch } from "@/lib/graphql/client";
import { publishedFlashcardDecksQuery } from "@/lib/graphql/flashcards";

type FlashcardDeck = {
  id: string;
  title: string;
  description: string;
  status: string;
  courseId: string;
  courseTitle: string;
  cardCount: number;
  avgMastery: number;
  createdAt: string;
  updatedAt: string;
};

type DecksData = {
  flashcardDecks: FlashcardDeck[];
};

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecks() {
      try {
        const result = await graphqlFetch<DecksData>({
          query: publishedFlashcardDecksQuery,
        });
        setDecks(result.flashcardDecks ?? []);
      } catch (err) {
        console.error("Failed to fetch flashcard decks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDecks();
  }, []);

  const filteredDecks = decks.filter(
    (deck) =>
      !search ||
      deck.title.toLowerCase().includes(search.toLowerCase()) ||
      deck.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCards = decks.reduce((sum, d) => sum + d.cardCount, 0);
  const avgMastery =
    decks.length > 0
      ? Math.round(decks.reduce((sum, d) => sum + d.avgMastery, 0) / decks.length)
      : 0;

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-8 pb-20">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Layers className="size-3" />
              Study Hub
            </div>
            <h1
              className="text-section text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Flash Cards
            </h1>
            <p className="max-w-lg text-[15px] text-muted-foreground leading-relaxed">
              Master concepts with spaced repetition. Flip, rate your confidence,
              and let the algorithm optimize your review schedule.
            </p>
          </div>
          <a
            href="/flashcards/create"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Create Deck
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Cards", value: totalCards, icon: Layers, color: "text-blue-500" },
            { label: "Avg. Mastery", value: `${avgMastery}%`, icon: Brain, color: "text-violet-500" },
            { label: "Streak", value: "5", icon: Flame, color: "text-orange-500" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 transition-all hover:shadow-elevation-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search decks or courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-card pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Deck Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground text-sm">Loading decks...</p>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Layers className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold">No flashcard decks available</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Check back later for new study materials
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDecks.map((deck) => (
              <div
                key={deck.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card/40 p-5 transition-all hover:border-primary/20 hover:shadow-elevation-2"
              >
                {/* Course badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <BookOpen className="size-3" />
                    {deck.courseTitle || "General"}
                  </span>
                  {deck.cardCount > 0 && (
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {deck.cardCount} cards
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-[14px] font-semibold tracking-tight mb-1 group-hover:text-primary transition-colors">
                  {deck.title}
                </h3>
                <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                  {deck.description || "Study this deck to master key concepts"}
                </p>

                {/* Mastery bar */}
                {deck.avgMastery > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-muted-foreground">Mastery</span>
                      <span className="text-[10px] font-semibold">{deck.avgMastery}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.min(deck.avgMastery, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-auto flex items-center gap-2">
                  <a
                    href={`/flashcards/${deck.id}/study`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    <Sparkles className="size-3.5" />
                    Study Now
                    <ArrowRight className="size-3.5" />
                  </a>
                  <a
                    href={`/flashcards/${deck.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
                  >
                    <Settings2 className="size-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
