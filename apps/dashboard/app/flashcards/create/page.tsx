"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@repo/ui/button";
import {
  Cards,
  Plus,
  Trash,
  ArrowLeft,
  Sparkle,
  CaretDown,
  Warning,
  UploadSimple,
} from "@phosphor-icons/react";
import type { Flashcard, FlashcardDeckFormData } from "../types";
import { saveDeck } from "../persistence";
import { graphqlFetch } from "../../../lib/graphql/client";
import { adminCoursesQuery } from "../../../lib/graphql/courses";
import { lessonsQuery } from "../../../lib/graphql/courses";
import { parseFlashcardsCsv } from "../csv";

type Course = {
  id: string;
  title?: string;
  name?: string;
};

type Lesson = {
  id: string;
  title: string;
  content: string;
};

type CoursesData = {
  courses: Course[];
};

type LessonsData = {
  lessons: Lesson[];
};

export default function CreateFlashcardDeckPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [showLessonPicker, setShowLessonPicker] = useState(false);
  const [csvMessage, setCsvMessage] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FlashcardDeckFormData>({
    title: "",
    description: "",
    courseId: "",
    cards: [{ id: "new-0", front: "", back: "", position: 0, hint: "", tags: [] }],
  });

  useEffect(() => {
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
    fetchCourses();
  }, []);

  // Fetch lessons when course changes
  useEffect(() => {
    if (!formData.courseId) {
      setLessons([]);
      return;
    }
    async function fetchLessons() {
      try {
        const result = await graphqlFetch<LessonsData>({
          query: lessonsQuery,
        });
        // Filter lessons to the selected course
        const allLessons = result.lessons ?? [];
        setLessons(allLessons);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    }
    fetchLessons();
  }, [formData.courseId]);

  const handleGenerateFromLesson = async () => {
    const lesson = lessons.find((l) => l.id === selectedLessonId);
    if (!lesson) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonContent: lesson.content,
          lessonTitle: lesson.title,
          cardCount: 5,
          context: "lesson",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      const generatedCards: Flashcard[] = (data.cards || []).map(
        (card: { front: string; back: string; hint?: string; tags?: string[] }, i: number) => ({
          id: `gen-${Date.now()}-${i}`,
          front: card.front,
          back: card.back,
          position: i,
          hint: card.hint || "",
          tags: card.tags || [],
        })
      );

      if (generatedCards.length > 0) {
        setFormData((prev) => ({
          ...prev,
          cards: [...prev.cards, ...generatedCards],
        }));
      }

      setShowLessonPicker(false);
      setSelectedLessonId("");
    } catch (err) {
      console.error("Failed to generate flashcards:", err);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const addCard = () => {
    setFormData((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          id: `new-${prev.cards.length}`,
          front: "",
          back: "",
          position: prev.cards.length,
          hint: "",
          tags: [],
        },
      ],
    }));
  };

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const importedCards = parseFlashcardsCsv(await file.text());
      setFormData((previous) => {
        const hasOnlyBlankCard =
          previous.cards.length === 1 &&
          !previous.cards[0]?.front.trim() &&
          !previous.cards[0]?.back.trim();
        const cards = hasOnlyBlankCard
          ? importedCards
          : [...previous.cards, ...importedCards];
        return {
          ...previous,
          cards: cards.map((card, position) => ({ ...card, position })),
        };
      });
      setCsvMessage(
        `Imported ${importedCards.length} card${importedCards.length === 1 ? "" : "s"} from ${file.name}.`
      );
    } catch (error) {
      setCsvMessage(
        error instanceof Error ? error.message : "Could not import the CSV file."
      );
    }
  };

  const removeCard = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  const updateCard = (index: number, field: keyof Flashcard, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      ),
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a deck title.");
      return;
    }
    if (!formData.courseId) {
      alert("Please select a course.");
      return;
    }
    const validCards = formData.cards.filter((c) => c.front.trim() && c.back.trim());
    if (validCards.length === 0) {
      alert("Please add at least one card with both front and back content.");
      return;
    }

    setSaving(true);
    try {
      await saveDeck({ ...formData, cards: validCards });
      window.location.href = "/flashcards";
    } catch (err) {
      console.error("Failed to save deck:", err);
      alert("Failed to save deck. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href="/flashcards">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Create Flashcard Deck
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add cards for spaced repetition learning
          </p>
        </div>
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
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Biology Chapter 5"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="What this deck covers..."
              rows={2}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Course *
            </label>
            <div className="relative">
              <select
                value={formData.courseId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, courseId: e.target.value }))
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.name}
                  </option>
                ))}
              </select>
              <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Cards ({formData.cards.length})
          </h2>
          <div className="flex items-center gap-2">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvImport}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => csvInputRef.current?.click()}
            >
              <UploadSimple className="h-3 w-3" />
              Import CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8"
              onClick={() => setShowLessonPicker(true)}
              disabled={!formData.courseId || generating}
            >
              <Sparkle className="h-3 w-3" />
              {generating ? "Generating..." : "Generate from Lesson"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={addCard}>
              <Plus className="h-3 w-3" />
              Add Card
            </Button>
          </div>
        </div>
        {csvMessage && (
          <div
            role="status"
            className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
          >
            {csvMessage}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          CSV columns: front, back, hint, tags. Question and answer are also accepted.
          Wrap fields containing commas in double quotes.
        </p>

        {formData.cards.map((card, index) => (
          <div key={card.id || index} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Card #{index + 1}
              </span>
              {formData.cards.length > 1 && (
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
                  onChange={(e) => updateCard(index, "front", e.target.value)}
                  placeholder="What is photosynthesis?"
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
                  onChange={(e) => updateCard(index, "back", e.target.value)}
                  placeholder="The process by which plants convert sunlight..."
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
                  onChange={(e) => updateCard(index, "hint", e.target.value)}
                  placeholder="Think about sunlight..."
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
                    updateCard(
                      index,
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="biology, plants, energy"
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
          {saving ? "Saving..." : "Create Deck"}
        </Button>
        <Button variant="outline" asChild>
          <a href="/flashcards">Cancel</a>
        </Button>
      </div>

      {/* Lesson Picker Modal */}
      {showLessonPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-sm font-semibold">Generate from Lesson</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowLessonPicker(false)}>
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground">
                Select a lesson to auto-generate flashcards from its content. AI will create 5 cards covering key concepts.
              </p>
              <div className="relative">
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a lesson...</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {!formData.courseId && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                  <Warning className="h-3.5 w-3.5 shrink-0" />
                  Select a course first to see available lessons
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  onClick={handleGenerateFromLesson}
                  disabled={!selectedLessonId || generating}
                  className="gap-2"
                >
                  <Sparkle className="h-3.5 w-3.5" />
                  {generating ? "Generating..." : "Generate Cards"}
                </Button>
                <Button variant="outline" onClick={() => setShowLessonPicker(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
