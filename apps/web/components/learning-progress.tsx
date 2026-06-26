"use client";

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  Lock,
  Play,
  TrendingUp,
  Clock,
  Flame,
  Target,
  BookOpen,
  Zap,
} from "lucide-react";
import {
  type DisplayModule,
  type DisplayLesson,
} from "@/lib/graphql/normalize";

// ─── Progress Ring ────────────────────────────────────────────────────

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 5,
  className = "",
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-bold">{progress}%</span>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className = "",
  animated = true,
}: {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  animated?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-[11px] font-semibold text-primary">
              {progress}%
            </span>
          )}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full bg-primary ${
            animated ? "transition-all duration-700" : ""
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Lesson Progress Indicator ────────────────────────────────────────

export function LessonProgressIcon({
  isCompleted,
  isActive,
}: {
  isCompleted?: boolean;
  isActive?: boolean;
}) {
  if (isCompleted) {
    return (
      <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckCircle2 className="size-3" />
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex size-5 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
        <Play className="size-2.5 text-primary fill-primary" />
      </div>
    );
  }

  return (
    <div className="flex size-5 items-center justify-center rounded-full border border-muted-foreground/20 bg-muted/30">
      <Lock className="size-2.5 text-muted-foreground/40" />
    </div>
  );
}

// ─── Course Progress Card ─────────────────────────────────────────────

export function CourseProgressCard({
  courseTitle,
  progress,
  currentLesson,
  totalLessons,
  nextLessonTitle,
  nextLessonHref,
}: {
  courseTitle: string;
  progress: number;
  currentLesson: number;
  totalLessons: number;
  nextLessonTitle?: string;
  nextLessonHref?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-elevation-2">
      <div className="flex items-start gap-4">
        <ProgressRing progress={progress} size={56} strokeWidth={4} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-semibold line-clamp-1 tracking-tight">
            {courseTitle}
          </h4>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Lesson {currentLesson} of {totalLessons}
          </p>
          <ProgressBar progress={progress} showPercentage={false} />
        </div>
      </div>
      {nextLessonTitle && nextLessonHref && (
        <a
          href={nextLessonHref}
          className="mt-4 flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors hover:bg-secondary/50 group"
        >
          <div className="flex items-center gap-2">
            <Play className="size-3.5 text-primary" />
            <span className="text-[12px] font-medium">
              Next: {nextLessonTitle}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
            Continue →
          </span>
        </a>
      )}
    </div>
  );
}

// ─── Learning Streak Widget ───────────────────────────────────────────

export function LearningStreakWidget({
  streakDays,
  weeklyGoal,
  weeklyProgress,
}: {
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert to Mon=0

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-orange-500" />
          <span className="text-[13px] font-semibold tracking-tight">
            {streakDays} day streak
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {weeklyProgress}/{weeklyGoal} this week
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {days.map((day, i) => {
          const isCompleted = i < adjustedToday;
          const isToday = i === adjustedToday;

          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "bg-primary/10 text-primary border-2 border-primary"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  day
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Learning Stats Grid ──────────────────────────────────────────────

export function LearningStatsGrid({
  stats,
}: {
  stats: Array<{
    label: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color?: string;
  }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 rounded-xl border bg-card p-3.5 transition-shadow hover:shadow-elevation-1"
        >
          <div className="flex items-center justify-between">
            <stat.icon
              className={`size-4 ${
                stat.color || "text-muted-foreground"
              }`}
            />
            {stat.trend && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500">
                <TrendingUp className="size-2.5" />
                {stat.trend}
              </span>
            )}
          </div>
          <span className="text-xl font-bold tracking-tight">{stat.value}</span>
          <span className="text-[11px] text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Module Progress Overview ─────────────────────────────────────────

export function ModuleProgressOverview({
  modules,
}: {
  modules: DisplayModule[];
}) {
  const totalLessons = modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-semibold tracking-tight">
          Course Progress
        </h4>
        <span className="text-[11px] text-muted-foreground">
          {modules.length} modules • {totalLessons} lessons
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {modules.map((module, i) => (
          <div key={module.id} className="flex items-center gap-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-[11px] font-semibold text-muted-foreground">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate">{module.title}</p>
              <ProgressBar
                progress={0}
                showPercentage={false}
                animated={false}
                className="mt-1"
              />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {module.lessons.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
