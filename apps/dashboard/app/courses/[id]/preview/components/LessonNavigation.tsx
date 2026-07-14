"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

interface AdjacentLesson {
  id: string | number;
  title: string;
}

interface LessonNavigationProps {
  previousLesson: AdjacentLesson | null;
  nextLesson: AdjacentLesson | null;
  onNavigate: (id: string | number) => void;
}

export function LessonNavigation({
  previousLesson,
  nextLesson,
  onNavigate,
}: LessonNavigationProps) {
  if (!previousLesson && !nextLesson) return null;

  return (
    <div className="flex items-center justify-between gap-3">
      {previousLesson ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onNavigate(previousLesson.id)}
          className="min-w-0 max-w-[48%] cursor-btn-hover focus-warm transition-all duration-150 text-foreground hover:bg-surface-100"
        >
          <CaretLeft className="h-4 w-4 shrink-0 mr-2" />
          <div className="text-left">
            <div className="text-xs text-muted-foreground">Previous</div>
            <div className="text-sm truncate">{previousLesson.title}</div>
          </div>
        </Button>
      ) : (
        <div />
      )}

      {nextLesson ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onNavigate(nextLesson.id)}
          className="min-w-0 max-w-[48%] cursor-btn-hover focus-warm transition-all duration-150 text-foreground hover:bg-surface-100"
        >
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next</div>
            <div className="text-sm truncate">{nextLesson.title}</div>
          </div>
          <CaretRight className="h-4 w-4 shrink-0 ml-2" />
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}
