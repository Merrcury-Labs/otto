"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  Plus,
  MagnifyingGlass,
  GridFour,
  List,
  PencilSimple,
  Eye,
  Trash,
  Cards,
  Brain,
  Sparkle,
  CheckCircle,
  Circle,
  BookOpen,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { DeckPreviewModal } from "./components/DeckPreviewModal";
import type { FlashcardDeck } from "./types";
import { graphqlFetch } from "../../lib/graphql/client";
import { adminFlashcardDecksQuery, deleteFlashcardDeckMutation } from "../../lib/graphql/flashcards";

type DeckStats = {
  total: number;
  published: number;
  totalReviews: number;
  averageMastery: number;
};

type GraphqlDeck = Omit<FlashcardDeck, "status"> & {
  status: Uppercase<FlashcardDeck["status"]>;
};

type AdminDecksData = {
  flashcardDecks: GraphqlDeck[];
  flashcardDeckStats: DeckStats;
};

const emptyStats: DeckStats = {
  total: 0,
  published: 0,
  totalReviews: 0,
  averageMastery: 0,
};

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [stats, setStats] = useState<DeckStats>(emptyStats);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewDeck, setPreviewDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecks() {
      try {
        const result = await graphqlFetch<AdminDecksData>({
          query: adminFlashcardDecksQuery,
          variables: { ownerUserId: "" },
        });
        const normalized = (result.flashcardDecks ?? []).map((d) => ({
          ...d,
          status: d.status.toLowerCase() as FlashcardDeck["status"],
        }));
        setDecks(normalized);
        setStats(result.flashcardDeckStats ?? emptyStats);
      } catch (err) {
        console.error("Failed to fetch flashcard decks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDecks();
  }, []);

  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      !search ||
      deck.title.toLowerCase().includes(search.toLowerCase()) ||
      deck.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || deck.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string | number) => {
    if (!confirm("Delete this deck? This cannot be undone.")) return;
    try {
      await graphqlFetch({ query: deleteFlashcardDeckMutation, variables: { id } });
      setDecks((prev) => prev.filter((d) => String(d.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete deck:", err);
    }
  };

  const statCards = [
    { label: "Total Decks", value: stats.total, icon: Cards, color: "text-blue-500" },
    { label: "Published", value: stats.published, icon: CheckCircle, color: "text-emerald-500" },
    { label: "Total Reviews", value: stats.totalReviews, icon: Brain, color: "text-violet-500" },
    { label: "Avg. Mastery", value: `${stats.averageMastery}%`, icon: Sparkle, color: "text-amber-500" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flash Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage flashcard decks for spaced repetition learning
          </p>
        </div>
        <Button asChild className="gap-2">
          <a href="/flashcards/create">
            <Plus className="h-4 w-4" />
            Create Deck
          </a>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="cursor-card transition-all hover:cursor-card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search decks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {["all", "published", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <GridFour className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground text-sm">Loading decks...</p>
        </div>
      ) : filteredDecks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Cards className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold">No flashcard decks yet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first deck to start building study materials
            </p>
          </div>
          <Button asChild size="sm" className="gap-2">
            <a href="/flashcards/create">
              <Plus className="h-3.5 w-3.5" />
              Create Deck
            </a>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck) => (
            <Card
              key={deck.id}
              className="cursor-card transition-all hover:cursor-card-hover group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">
                      {deck.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {deck.description || "No description"}
                    </CardDescription>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      deck.status === "published"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {deck.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {deck.courseTitle || "No course"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Cards className="h-3 w-3" />
                    {deck.cardCount} cards
                  </span>
                  {deck.avgMastery > 0 && (
                    <span className="flex items-center gap-1">
                      <Sparkle className="h-3 w-3" />
                      {deck.avgMastery}% mastery
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => setPreviewDeck(deck)}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    asChild
                  >
                    <a href={`/flashcards/${deck.id}/edit`}>
                      <PencilSimple className="h-3 w-3" />
                      Edit
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(deck.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Cards className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{deck.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{deck.courseTitle || "No course"}</span>
                    <span>{deck.cardCount} cards</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    deck.status === "published"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {deck.status}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPreviewDeck(deck)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                  <a href={`/flashcards/${deck.id}/edit`}>
                    <PencilSimple className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(deck.id)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDeck && (
        <DeckPreviewModal
          deck={previewDeck}
          onClose={() => setPreviewDeck(null)}
        />
      )}
    </div>
  );
}
