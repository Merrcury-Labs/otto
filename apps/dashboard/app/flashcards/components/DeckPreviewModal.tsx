"use client";

import { Button } from "@repo/ui/button";
import { X, Cards, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import type { FlashcardDeck } from "../types";
import { MarkdownPreview } from "../../courses/components/lesson-modal/MarkdownPreview";

type DeckPreviewModalProps = {
  deck: FlashcardDeck;
  onClose: () => void;
};

export function DeckPreviewModal({ deck, onClose }: DeckPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Cards className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{deck.title}</h2>
              <p className="text-xs text-muted-foreground">
                {deck.cardCount} cards · {deck.courseTitle || "No course"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Cards list */}
        <div className="overflow-y-auto max-h-[60vh] p-5">
          {deck.cards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No cards in this deck yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {deck.cards.map((card, index) => (
                <div
                  key={card.id || index}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                      #{index + 1}
                    </span>
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex gap-1">
                        {card.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Front
                      </p>
                      <div className="text-sm leading-relaxed">
                        <MarkdownPreview content={card.front} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Back
                      </p>
                      <div className="text-sm leading-relaxed">
                        <MarkdownPreview content={card.back} />
                      </div>
                    </div>
                  </div>
                  {card.hint && (
                    <p className="text-xs text-muted-foreground italic">
                      💡 Hint: {card.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
