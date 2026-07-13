"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import {
  Cards,
  Plus,
  Trash,
  ArrowLeft,
  CaretDown,
} from "@phosphor-icons/react";
import type { Flashcard, FlashcardDeck } from "../../types";
import { updateDeck, createCard, updateCard, deleteCard } from "../../persistence";
import { graphqlFetch } from "../../../../lib/graphql/client";
import { flashcardDeckDetailQuery, deleteFlashcardDeckMutation } from "../../../../lib/graphql/flashcards";
import { adminCoursesQuery } from "../../../../lib/graphql/courses";

type Course = {
  id: string;
  title?: string;
  name?: string;
};

type DeckDetailData = {
  flashcardDeck: FlashcardDeck;
};

type CoursesData = {
  courses: Course[];
};

export default function EditFlashcardDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deckId, setDeckId] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setDeckId(id);
      fetchDeck(id);
    });
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchDeck(id: string) {
    try {
      const result = await graphqlFetch<DeckDetailData>({
        query: flashcardDeckDetailQuery,
        variables: { id },
      });
      const d = result.flashcardDeck;
      if (d) {
        setDeck(d);
        setTitle(d.title);
        setDescription(d.description);
        setStatus(d.status);
        setCards(d.cards || []);
      }
    } catch (err) {
      console.error("Failed to fetch deck:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const result = await graphqlFetch<CoursesData>({
        query: adminCoursesQuery,
        variables: { ownerUserId: "" },
      });
      setCourses(result.courses ?? []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  }

  const addCard = () => {
    setCards((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, front: "", back: "", position: prev.length, hint: "", tags: [] },
    ]);
  };

  const removeCard = async (index: number) => {
    const card = cards[index];
    if (!card) return;
    if (card.id && !String(card.id).startsWith("new-")) {
      try {
        await deleteCard(String(card.id));
      } catch (err) {
        console.error("Failed to delete card:", err);
      }
    }
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCardField = (index: number, field: keyof Flashcard, value: string | string[]) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a deck title.");
      return;
    }

    setSaving(true);
    try {
      // Update deck metadata
      await updateDeck(deckId, {
        title,
        description,
        status: status.toUpperCase(),
      });

      // Save new/updated cards
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!card || !card.front.trim() || !card.back.trim()) continue;

        if (String(card.id).startsWith("new-")) {
          await createCard(deckId, card, i);
        } else {
          await updateCard(String(card.id), {
            front: card.front,
            back: card.back,
            position: i,
            hint: card.hint,
            tags: card.tags,
          });
        }
      }

      window.location.href = "/flashcards";
    } catch (err) {
      console.error("Failed to save deck:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entire deck? This cannot be undone.")) return;
    try {
      await graphqlFetch({
        query: deleteFlashcardDeckMutation,
        variables: { id: deckId },
      });
      window.location.href = "/flashcards";
    } catch (err) {
      console.error("Failed to delete deck:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">Loading deck...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href="/flashcards">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Edit Deck</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {deck?.courseTitle || "Loading..."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash className="h-3.5 w-3.5 mr-1.5" />
          Delete
        </Button>
      </div>

      {/* Deck Info */}
      <div className="rounded-xl border p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Cards className="h-4 w-4 text-primary" />
          Deck Details
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Status
            </label>
            <div className="flex rounded-lg border overflow-hidden w-fit">
              {["DRAFT", "PUBLISHED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${
                    status === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {s === "DRAFT" ? "Draft" : "Published"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Cards ({cards.length})</h2>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={addCard}>
            <Plus className="h-3 w-3" />
            Add Card
          </Button>
        </div>

        {cards.map((card, index) => (
          <div key={card.id || index} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Card #{index + 1}
              </span>
              {cards.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => removeCard(index)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Front (Question)
                </label>
                <textarea
                  value={card.front}
                  onChange={(e) => updateCardField(index, "front", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Back (Answer)
                </label>
                <textarea
                  value={card.back}
                  onChange={(e) => updateCardField(index, "back", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
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
                  value={card.hint || ""}
                  onChange={(e) => updateCardField(index, "hint", e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={(card.tags || []).join(", ")}
                  onChange={(e) =>
                    updateCardField(
                      index,
                      "tags",
                      e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                    )
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" asChild>
          <a href="/flashcards">Cancel</a>
        </Button>
      </div>
    </div>
  );
}
