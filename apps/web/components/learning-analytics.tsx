"use client";

import * as React from "react";
import {
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Flame,
  Trophy,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Zap,
  GraduationCap,
  Star,
} from "lucide-react";
import { ProgressRing, ProgressBar } from "@/components/learning-progress";

// ─── Types ────────────────────────────────────────────────────────────

type WeeklyDataPoint = {
  day: string;
  hours: number;
  label: string;
};

type SkillData = {
  name: string;
  level: number; // 0-100
  category: string;
};

type RecentActivity = {
  id: string;
  type: "lesson_completed" | "quiz_passed" | "streak_milestone" | "course_started";
  title: string;
  subtitle?: string;
  timestamp: string;
};

type RecommendedCourse = {
  id: string;
  title: string;
  reason: string;
  level: string;
  category: string;
};

type LearningAnalyticsProps = {
  weeklyData?: WeeklyDataPoint[];
  skills?: SkillData[];
  recentActivity?: RecentActivity[];
  recommendations?: RecommendedCourse[];
  streakDays?: number;
  totalHours?: number;
  coursesCompleted?: number;
  averageScore?: number;
  weeklyGoalHours?: number;
  weeklyProgressHours?: number;
};

// ─── Default mock data ────────────────────────────────────────────────

const defaultWeeklyData: WeeklyDataPoint[] = [
  { day: "Mon", hours: 1.5, label: "1.5h" },
  { day: "Tue", hours: 2.0, label: "2h" },
  { day: "Wed", hours: 0.5, label: "30m" },
  { day: "Thu", hours: 3.0, label: "3h" },
  { day: "Fri", hours: 1.0, label: "1h" },
  { day: "Sat", hours: 2.5, label: "2.5h" },
  { day: "Sun", hours: 0, label: "—" },
];

const defaultSkills: SkillData[] = [
  { name: "React Fundamentals", level: 85, category: "Frontend" },
  { name: "TypeScript", level: 72, category: "Languages" },
  { name: "System Design", level: 45, category: "Architecture" },
  { name: "Data Structures", level: 60, category: "CS Fundamentals" },
  { name: "API Design", level: 78, category: "Backend" },
];

const defaultActivity: RecentActivity[] = [
  {
    id: "1",
    type: "lesson_completed",
    title: "Completed: Introduction to Hooks",
    subtitle: "React Fundamentals",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "quiz_passed",
    title: "Passed: TypeScript Quiz #3",
    subtitle: "Score: 92%",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    type: "streak_milestone",
    title: "7-day learning streak! 🎉",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    type: "course_started",
    title: "Started: System Design Masterclass",
    timestamp: "3 days ago",
  },
];

const defaultRecommendations: RecommendedCourse[] = [
  {
    id: "r1",
    title: "Advanced React Patterns",
    reason: "Based on your React progress",
    level: "Advanced",
    category: "Frontend",
  },
  {
    id: "r2",
    title: "Database Design Fundamentals",
    reason: "Complements your API skills",
    level: "Intermediate",
    category: "Backend",
  },
];

// ─── Activity Icon ────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: RecentActivity["type"] }) {
  const iconMap = {
    lesson_completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    quiz_passed: { icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
    streak_milestone: { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    course_started: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  };

  const { icon: Icon, color, bg } = iconMap[type];

  return (
    <div className={`flex size-8 items-center justify-center rounded-lg ${bg}`}>
      <Icon className={`size-4 ${color}`} />
    </div>
  );
}

// ─── Weekly Activity Chart ────────────────────────────────────────────

function WeeklyActivityChart({ data }: { data: WeeklyDataPoint[] }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">
            Weekly Activity
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Hours spent learning this week
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <div className="size-2 rounded-full bg-primary" />
          Study time
        </div>
      </div>

      <div className="flex h-44 items-end gap-3">
        {data.map((point, i) => {
          const heightPercent = (point.hours / maxHours) * 100;
          const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);

          return (
            <div key={point.day} className="group relative flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                    isToday
                      ? "bg-primary"
                      : "bg-primary/25 group-hover:bg-primary/40"
                  }`}
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    minHeight: "4px",
                  }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-foreground text-background px-2 py-1 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {point.label}
                </div>
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {point.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skill Progress ───────────────────────────────────────────────────

function SkillProgress({ skills }: { skills: SkillData[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">
            Skill Progress
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Your learning proficiency
          </p>
        </div>
        <GraduationCap className="size-4 text-muted-foreground" />
      </div>

      <div className="flex flex-col gap-4">
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium truncate">
                  {skill.name}
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    skill.level >= 80
                      ? "text-emerald-500"
                      : skill.level >= 60
                      ? "text-blue-500"
                      : skill.level >= 40
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {skill.level}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    skill.level >= 80
                      ? "bg-emerald-500"
                      : skill.level >= 60
                      ? "bg-blue-500"
                      : skill.level >= 40
                      ? "bg-amber-500"
                      : "bg-muted-foreground/40"
                  }`}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Activity Feed ─────────────────────────────────────────────

function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-semibold tracking-tight">
          Recent Activity
        </h3>
        <Clock className="size-4 text-muted-foreground" />
      </div>

      <div className="flex flex-col gap-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg p-2.5 -mx-0.5 hover:bg-secondary/30 transition-colors"
          >
            <ActivityIcon type={activity.type} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-snug">
                {activity.title}
              </p>
              {activity.subtitle && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {activity.subtitle}
                </p>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
              {activity.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Personalized Recommendations ─────────────────────────────────────

function Recommendations({
  courses,
}: {
  courses: RecommendedCourse[];
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight">
            Recommended for You
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Based on your learning path
          </p>
        </div>
        <Zap className="size-4 text-amber-500" />
      </div>

      <div className="flex flex-col gap-3">
        {courses.map((course) => (
          <a
            key={course.id}
            href={`/courses/${course.id}`}
            className="group flex items-start gap-3 rounded-lg border p-3.5 transition-all hover:border-primary/20 hover:shadow-elevation-1"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Star className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">
                {course.title}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {course.reason}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {course.level}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {course.category}
                </span>
              </div>
            </div>
            <ArrowUpRight className="size-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Streak & Goals Card ──────────────────────────────────────────────

function StreakGoalsCard({
  streakDays,
  weeklyGoalHours,
  weeklyProgressHours,
}: {
  streakDays: number;
  weeklyGoalHours: number;
  weeklyProgressHours: number;
}) {
  const progressPercent = Math.min(
    Math.round((weeklyProgressHours / weeklyGoalHours) * 100),
    100
  );

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Streak header */}
      <div className="relative bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500/15">
            <Flame className="size-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[24px] font-bold tracking-tight leading-none">
              {streakDays}
            </p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              day streak
            </p>
          </div>
        </div>
      </div>

      {/* Weekly goal */}
      <div className="p-5 pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium text-muted-foreground">
            Weekly Goal
          </span>
          <span className="text-[12px] font-semibold">
            {weeklyProgressHours}h / {weeklyGoalHours}h
          </span>
        </div>
        <ProgressBar
          progress={progressPercent}
          showPercentage={false}
        />
        <p className="mt-2 text-[11px] text-muted-foreground">
          {weeklyGoalHours - weeklyProgressHours > 0
            ? `${(weeklyGoalHours - weeklyProgressHours).toFixed(1)}h remaining this week`
            : "🎉 You've hit your weekly goal!"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Analytics Dashboard ─────────────────────────────────────────

export function LearningAnalytics({
  weeklyData = defaultWeeklyData,
  skills = defaultSkills,
  recentActivity = defaultActivity,
  recommendations = defaultRecommendations,
  streakDays = 5,
  totalHours = 47,
  coursesCompleted = 3,
  averageScore = 84,
  weeklyGoalHours = 10,
  weeklyProgressHours = 7.5,
}: LearningAnalyticsProps) {
  const stats = [
    {
      label: "Learning Hours",
      value: totalHours,
      icon: Clock,
      color: "text-blue-500",
      trend: "+12%",
    },
    {
      label: "Courses Done",
      value: coursesCompleted,
      icon: GraduationCap,
      color: "text-emerald-500",
    },
    {
      label: "Avg. Score",
      value: `${averageScore}%`,
      icon: Target,
      color: "text-amber-500",
      trend: "+5%",
    },
    {
      label: "Day Streak",
      value: streakDays,
      icon: Flame,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col gap-8 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <BarChart3 className="size-3" />
            Learning Analytics
          </div>
          <h1
            className="text-section text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Progress
          </h1>
          <p className="max-w-lg text-[15px] text-muted-foreground leading-relaxed">
            Track your learning journey, identify strengths, and discover what
            to focus on next.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 transition-all hover:shadow-elevation-2"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </span>
                {stat.trend && (
                  <span className="flex items-center text-[11px] font-semibold text-emerald-500">
                    <TrendingUp className="mr-0.5 size-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <WeeklyActivityChart data={weeklyData} />
            <SkillProgress skills={skills} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <StreakGoalsCard
              streakDays={streakDays}
              weeklyGoalHours={weeklyGoalHours}
              weeklyProgressHours={weeklyProgressHours}
            />
            <ActivityFeed activities={recentActivity} />
            <Recommendations courses={recommendations} />
          </div>
        </div>
      </div>
    </div>
  );
}
