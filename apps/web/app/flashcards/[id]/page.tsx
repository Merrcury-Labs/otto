"use client";

import { useState, useEffect } from "react";
import {
  Cards,
  Plus,
  Trash,
  ArrowLeft,
  Sparkle,
  PencilSimple,
  Check,
  X,
  BookOpen,
} from "@phosphor-icons/react";
import { graphqlFetch } from "@/lib/graphql/client";
import {
  flashcardDeckDetailQuery,
  createFlashcardMutation,
  updateFlashcardMutation,
  deleteFlashcardMutation,
  updateFlashcardDeckMutation,
  deleteFlashcardDeckMutation,
} from "@/lib/graphql/flashcards";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  position: number;
  hint: string;
  tags: string[];
};

type Deck = {
  id: string;
  title: string;
  description: string;
  status: string;
  courseId: string;
  courseTitle: string;
  cardCount: number;
  avgMastery: number;
  cards: Flashcard[];
};

type DeckData = {
  flashcardDeck: Deck;
};

type CardData = {
  createFlashcard: { id: string };
  updateFlashcard: { id: string; front: string; back: string; position: number; hint: string; tags: string[] };
};

type DeckUpdateData = {
  updateFlashcardDeck: { id: string; title: string; description: string; status: string };
}

export default function DeckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [deckId, setDeckId] = useState<string>("");
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  // Deck editing state
  const [editingDeck, setEditingDeck] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [savingDeck, setSavingDeck] = useState(false);

  // Card editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editHint, setEditHint] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [savingCard, setSavingCard] = useState(false);

  // New card state
  const [addingCard, setAddingCard] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newHint, setNewHint] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);
  const [savingNewCard, setSavingNewCard] = useState(false);

  // Delete confirmation
  const [deletingDeck, setDeletingDeck] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // Unwrap params promise
  useEffect(() => {
    params.then((p) => setDeckId(p.id));
  }, [params]);

  useEffect(() => {
    if (!deckId) return;
    async function fetchDeck() {
      try {
        const result = await graphqlFetch<DeckData>({
          query: flashcardDeckDetailQuery,
          variables: { id: deckId },
        });
        setDeck(result.flashcardDeck);
        setDeckTitle(result.flashcardDeck.title);
        setDeckDescription(result.flashcardDeck.description);
      } catch (err) {
        console.error("Failed to fetch deck:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, [deckId]);

  const startEditDeck = () => {
    setDeckTitle(deck?.title ?? "");
    setDeckDescription(deck?.description ?? "");
    setEditingDeck(true);
  };

  const cancelEditDeck = () => {
    setDeckTitle(deck?.title ?? "");
    setDeckDescription(deck?.description ?? "");
    setEditingDeck(false);
  };

  const saveDeck = async () => {
    if (!deckTitle.trim()) return;
    setSavingDeck(true);
    try {
      await graphqlFetch<DeckUpdateData>({
        query: updateFlashcardDeckMutation,
        variables: {
          id: deckId,
          title: deckTitle.trim(),
          description: deckDescription.trim(),
        },
      });
      setDeck((prev) => prev ? { ...prev, title: deckTitle.trim(), description: deckDescription.trim() } : prev);
      setEditingDeck(false);
    } catch (err) {
      console.error("Failed to update deck:", err);
      alert("Failed to update deck.");
    } finally {
      setSavingDeck(false);
    }
  };

  const handleDeleteDeck = async () => {
    setDeletingDeck(true);
    try {
      await graphqlFetch({
        query: deleteFlashcardDeckMutation,
        variables: { id: deckId },
      });
      window.location.href = "/flashcards";
    } catch (err) {
      console.error("Failed to delete deck:", err);
      alert("Failed to delete deck.");
      setDeletingDeck(false);
    }
  };

  const startEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
    setEditHint(card.hint || "");
    setEditTags(card.tags || []);
  };

  const cancelEditCard = () => {
    setEditingCardId(null);
  };

  const saveCard = async (cardId: string) => {
    if (!editFront.trim() || !editBack.trim()) return;
    setSavingCard(true);
    try {
      await graphqlFetch<CardData>({
        query: updateFlashcardMutation,
        variables: {
          id: cardId,
          front: editFront.trim(),
          back: editBack.trim(),
          hint: editHint.trim(),
          tags: editTags,
        },
      });
      setDeck((prev) => prev ? {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId
            ? { ...c, front: editFront.trim(), back: editBack.trim(), hint: editHint.trim(), tags: editTags }
            : c
        ),
      } : prev);
      setEditingCardId(null);
    } catch (err) {
      console.error("Failed to update card:", err);
      alert("Failed to update card.");
    } finally {
      setSavingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await graphqlFetch({
        query: deleteFlashcardMutation,
        variables: { id: cardId },
      });
      setDeck((prev) => prev ? {
        ...prev,
        cards: prev.cards.filter((c) => c.id !== cardId),
      } : prev);
      setDeletingCardId(null);
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    setSavingNewCard(true);
    try {
      const result = await graphqlFetch<CardData>({
        query: createFlashcardMutation,
        variables: {
          deckId,
          front: newFront.trim(),
          back: newBack.trim(),
          position: deck?.cards.length ?? 0,
          hint: newHint.trim(),
          tags: newTags,
        },
      });
      const newCard: Flashcard = {
        id: result.createFlashcard.id,
        front: newFront.trim(),
        back: newBack.trim(),
        position: deck?.cards.length ?? 0,
        hint: newHint.trim(),
        tags: newTags,
      };
      setDeck((prev) => prev ? { ...prev, cards: [...prev.cards, newCard] } : prev);
      setNewFront("");
      setNewBack("");
      setNewHint("");
      setNewTags([]);
      setAddingCard(false);
    } catch (err) {
      console.error("Failed to add card:", err);
      alert("Failed to add card.");
    } finally {
      setSavingNewCard(false);
    }
  };

  const cancelAddCard = () => {
    setNewFront("");
    setNewBack("");
    setNewHint("");
    setNewTags([]);
    setAddingCard(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground text-sm">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="mx-auto max-w-3xl animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Cards className="size-7 text-primary" weight="duotone" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold">Deck not found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              This deck may have been deleted or doesn&apos;t exist
            </p>
          </div>
          <a
            href="/flashcards"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Back to Flashcards
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3">
          <a
            href="/flashcards"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </a>
          <div className="flex-1 min-w-0">
            {editingDeck ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  className="w-full rounded-xl border bg-card px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Deck title"
                />
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Description"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveDeck}
                    disabled={savingDeck || !deckTitle.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Check className="size-3" weight="bold" />
                    {savingDeck ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEditDeck}
                    className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:text-foreground"
                  >
                    <X className="size-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1
                  className="text-xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {deck.title}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {deck.description || "No description"}
                </p>
              </div>
            )}
          </div>
          {!editingDeck && (
            <div className="flex items-center gap-2">
              <button
                onClick={startEditDeck}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Edit deck"
              >
                <PencilSimple className="size-4" />
              </button>
              <a
                href={`/flashcards/${deckId}/study`}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Sparkle className="size-3.5" />
                Study
              </a>
            </div>
          )}
        </div>

        {/* Deck info bar */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-medium">
            <BookOpen className="size-3" />
            {deck.courseTitle || "General"}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-medium">
            {deck.cards.length} card{deck.cards.length !== 1 ? "s" : ""}
          </span>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-medium uppercase">
            {deck.status}
          </span>
        </div>

        {/* Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Cards ({deck.cards.length})
            </h2>
            <button
              onClick={() => setAddingCard(true)}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all hover:border-primary/20 hover:text-foreground"
            >
              <Plus className="size-3" weight="bold" />
              Add Card
            </button>
          </div>

          {/* New card form */}
          {addingCard && (
            <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                New Card
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Front (Question) *
                  </label>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="What is photosynthesis?"
                    rows={2}
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Back (Answer) *
                  </label>
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="The process by which plants convert sunlight..."
                    rows={2}
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Hint (optional)
                  </label>
                  <input
                    type="text"
                    value={newHint}
                    onChange={(e) => setNewHint(e.target.value)}
                    placeholder="Think about sunlight..."
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTags.join(", ")}
                    onChange={(e) =>
                      setNewTags(
                        e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="biology, plants, energy"
                    className="w-full rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddCard}
                  disabled={savingNewCard || !newFront.trim() || !newBack.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <Check className="size-3" weight="bold" />
                  {savingNewCard ? "Adding..." : "Add Card"}
                </button>
                <button
                  onClick={cancelAddCard}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:text-foreground"
                >
                  <X className="size-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing cards */}
          {deck.cards.length === 0 && !addingCard ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Cards className="size-6 text-primary" weight="duotone" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-semibold">No cards yet</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Add your first card to get started
                </p>
              </div>
            </div>
          ) : (
            deck.cards.map((card, index) => (
              <div
                key={card.id}
                className="rounded-2xl border bg-card/40 p-4 space-y-3"
              >
                {editingCardId === card.id ? (
                  <>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Card #{index + 1} — Editing
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                          Front (Question)
                        </label>
                        <textarea
                          value={editFront}
                          onChange={(e) => setEditFront(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                          Back (Answer)
                        </label>
                        <textarea
                          value={editBack}
                          onChange={(e) => setEditBack(e.target.value)}
                          rows={2}
                          className="w-full rounded-xl border bg-card px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                          Hint (optional)
                        </label>
                        <input
                          type="text"
                          value={editHint}
                          onChange={(e) => setEditHint(e.target.value)}
                          className="w-full rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                          Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={editTags.join(", ")}
                          onChange={(e) =>
                            setEditTags(
                              e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                            )
                          }
                          className="w-full rounded-xl border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveCard(card.id)}
                        disabled={savingCard || !editFront.trim() || !editBack.trim()}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                      >
                        <Check className="size-3" weight="bold" />
                        {savingCard ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEditCard}
                        className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:text-foreground"
                      >
                        <X className="size-3" />
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Card #{index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditCard(card)}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="Edit card"
                        >
                          <PencilSimple className="size-3.5" />
                        </button>
                        {deletingCardId === card.id ? (
                          <>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingCardId(null)}
                              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeletingCardId(card.id)}
                            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            title="Delete card"
                          >
                            <Trash className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                          Front
                        </span>
                        <p className="text-sm leading-relaxed">{card.front}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                          Back
                        </span>
                        <p className="text-sm leading-relaxed">{card.back}</p>
                      </div>
                    </div>
                    {(card.hint || (card.tags && card.tags.length > 0)) && (
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {card.hint && (
                          <span className="flex items-center gap-1">
                            💡 {card.hint}
                          </span>
                        )}
                        {card.tags && card.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            {card.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Danger zone */}
        <div className="border-t pt-6 mt-4">
          {deletingDeck ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive flex-1">
                Are you sure you want to delete this deck and all its cards? This cannot be undone.
              </p>
              <button
                onClick={handleDeleteDeck}
                disabled={deletingDeck}
                className="flex items-center gap-1.5 rounded-xl bg-destructive px-3 py-1.5 text-[12px] font-semibold text-destructive-foreground transition-all hover:bg-destructive/90"
              >
                Delete Deck
              </button>
              <button
                onClick={() => setDeletingDeck(false)}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-all hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeletingDeck(true)}
              className="text-[12px] text-muted-foreground transition-colors hover:text-destructive"
            >
              Delete this deck
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
