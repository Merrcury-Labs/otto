"use client";

import { useEffect, useMemo, useState } from "react";
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
  Users,
  TrendUp,
  Clock,
  DotsThreeVertical,
  CheckCircle,
  Circle,
  Brain,
  ListChecks,
  BookOpen,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { QuizPreviewModal } from "./components/QuizPreviewModal";
import type { Quiz, QuestionType } from "./types";
import { graphqlFetch } from "../../lib/graphql/client";
import { adminQuizzesQuery, deleteQuizMutation } from "../../lib/graphql/quizzes";

type QuizStats = {
  total: number;
  published: number;
  attempts: number;
  averageScore: number;
};

type GraphqlQuiz = Omit<Quiz, "status" | "questions"> & {
  status: Uppercase<Quiz["status"]>;
  questions: Array<{
    id: string | number;
    question: string;
    type: string;
    points: number;
    options: unknown;
    correctAnswer?: unknown;
    categories?: unknown;
    hint?: string;
  }>;
};

type AdminQuizzesData = {
  quizzes: GraphqlQuiz[];
  quizStats: QuizStats;
};

const emptyQuizStats: QuizStats = {
  total: 0,
  published: 0,
  attempts: 0,
  averageScore: 0,
};

const parseCorrectAnswer = (
  value?: string | boolean | number | number[] | Record<string, unknown> | unknown[] | null,
): Quiz["questions"][number]["correctAnswer"] => {
  if (value == null || value === "") {
    return undefined;
  }

  // Non-string values (booleans, numbers, arrays, objects) are already parsed
  if (typeof value !== "string") {
    return value;
  }

  // String values may be JSON-encoded or plain strings — try parsing first
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Map backend question type codes to dashboard QuestionType values
const mapQuestionType = (backendType: string): QuestionType => {
  const typeMap: Record<string, QuestionType> = {
    MCQ: "multiple-choice",
    TF: "true-false",
    REORDER: "drag-drop-order",
    CATEGORIZE: "drag-drop-category",
  };
  return typeMap[backendType] ?? "multiple-choice";
};

// Convert backend options (JSON objects/arrays) to a flat string[] for the dashboard
const normalizeOptions = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.map(String);
  }
  if (typeof raw === "object" && raw !== null) {
    const opts = raw as Record<string, unknown>;
    // {choices: [...]} or {items: [...]}
    if (Array.isArray(opts.choices)) return opts.choices.map(String);
    if (Array.isArray(opts.items)) return opts.items.map(String);
    // Flat object like {"A": "Option A", "B": "Option B"}
    const values = Object.values(opts).filter((v) => typeof v !== "object" && !Array.isArray(v));
    if (values.length > 0) return values.map(String);
  }
  return [];
};

// Extract category names from backend categories / options
const normalizeCategories = (rawCategories: unknown, rawOptions: unknown): string[] => {
  if (Array.isArray(rawCategories)) {
    return rawCategories.map(String);
  }
  if (typeof rawCategories === "object" && rawCategories !== null) {
    const cats = rawCategories as Record<string, unknown>;
    // { "Center": [], "Spread": [] } — keys are category names
    const keys = Object.keys(cats);
    if (keys.length > 0 && keys.every((k) => Array.isArray(cats[k]))) {
      return keys;
    }
    return keys;
  }
  // Check for buckets in options
  if (typeof rawOptions === "object" && rawOptions !== null) {
    const opts = rawOptions as Record<string, unknown>;
    if (opts.buckets && typeof opts.buckets === "object" && !Array.isArray(opts.buckets)) {
      return Object.keys(opts.buckets);
    }
  }
  return [];
};

// Derive categoryMapping (itemIndex → categoryIndex) from backend correctAnswer
const normalizeCategoryMapping = (
  correctAnswer: unknown,
  options: string[],
  categories: string[],
): Record<number, number> => {
  if (!correctAnswer || typeof correctAnswer !== "object" || Array.isArray(correctAnswer)) {
    return {};
  }
  const mapping: Record<number, number> = {};
  const answer = correctAnswer as Record<string, unknown>;

  // Check if it's a category→items format: {"Center": ["Mean"], "Spread": ["Range"]}
  const firstVal = Object.values(answer)[0];
  if (Array.isArray(firstVal)) {
    for (const [cat, items] of Object.entries(answer)) {
      if (!Array.isArray(items)) continue;
      const catIdx = categories.indexOf(cat);
      if (catIdx === -1) continue;
      for (const item of items) {
        const optIdx = options.indexOf(String(item));
        if (optIdx !== -1) mapping[optIdx] = catIdx;
      }
    }
    return mapping;
  }

  // It's an item→category format: {"Mean": "Center", "Range": "Spread"}
  for (const [item, cat] of Object.entries(answer)) {
    const optIdx = options.indexOf(String(item));
    const catIdx = categories.indexOf(String(cat));
    if (optIdx !== -1 && catIdx !== -1) mapping[optIdx] = catIdx;
  }

  // If keys are numeric indices (dashboard creation format)
  if (Object.keys(answer).every((k) => /^\d+$/.test(k))) {
    for (const [k, v] of Object.entries(answer)) {
      const optIdx = Number(k);
      const catIdx = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(optIdx) && !Number.isNaN(catIdx)) {
        mapping[optIdx] = catIdx;
      }
    }
  }

  return mapping;
};

// Resolve correctAnswer from backend format to dashboard index-based format
const normalizeCorrectAnswer = (
  type: QuestionType,
  rawCorrect: unknown,
  options: string[],
): Quiz["questions"][number]["correctAnswer"] => {
  if (rawCorrect == null) return undefined;

  switch (type) {
    case "multiple-choice": {
      // Backend may store: index (0), string ("0"), letter ("A"), or option text
      if (typeof rawCorrect === "number") return rawCorrect;
      if (typeof rawCorrect === "string") {
        if (/^\d+$/.test(rawCorrect)) return parseInt(rawCorrect, 10);
        if (/^[A-Z]$/.test(rawCorrect)) return rawCorrect.charCodeAt(0) - 65;
        // It's text — find matching option index
        const idx = options.indexOf(rawCorrect);
        return idx !== -1 ? idx : undefined;
      }
      return undefined;
    }
    case "true-false": {
      // Backend stores: true/false boolean, 0/1 integer, "true"/"false" string
      if (typeof rawCorrect === "boolean") return rawCorrect ? 0 : 1;
      if (typeof rawCorrect === "number") return rawCorrect === 1 ? 0 : 1;
      if (typeof rawCorrect === "string") {
        const lower = rawCorrect.toLowerCase();
        if (lower === "true" || rawCorrect === "1") return 0;
        if (lower === "false" || rawCorrect === "0") return 1;
      }
      return 0;
    }
    case "checkbox": {
      // Backend may store array of indices or text
      if (Array.isArray(rawCorrect)) {
        const indices = rawCorrect
          .map((v) => {
            if (typeof v === "number") return v;
            if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
            const idx = options.indexOf(String(v));
            return idx;
          })
          .filter((v) => v !== -1 && !Number.isNaN(v));
        return indices;
      }
      return undefined;
    }
    default:
      return parseCorrectAnswer(rawCorrect as string | boolean | number | number[] | Record<string, unknown> | unknown[] | null);
  }
};

const normalizeQuiz = (quiz: GraphqlQuiz): Quiz => {
  const questions: Quiz["questions"] = quiz.questions.map((q) => {
    const type = mapQuestionType(q.type);
    const options = normalizeOptions(q.options);
    const categories = type === "drag-drop-category"
      ? normalizeCategories(q.categories, q.options)
      : undefined;
    const categoryMapping = type === "drag-drop-category"
      ? normalizeCategoryMapping(q.correctAnswer, options, categories ?? [])
      : undefined;
    const correctAnswer = normalizeCorrectAnswer(type, q.correctAnswer, options);

    return {
      id: Number(q.id) || q.id,
      question: q.question,
      type,
      points: q.points,
      options,
      correctAnswer,
      categories,
      categoryMapping,
      hint: q.hint,
    };
  });

  return {
    id: Number(quiz.id) || quiz.id,
    title: quiz.title,
    description: quiz.description,
    duration: quiz.duration,
    status: quiz.status.toLowerCase() as Quiz["status"],
    courseId: quiz.courseId,
    courseTitle: quiz.courseTitle,
    attempts: quiz.attempts,
    avgScore: quiz.avgScore,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    questions,
  };
};

export default function QuizzesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [quizStats, setQuizStats] = useState<QuizStats>(emptyQuizStats);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [quizError, setQuizError] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-5 w-5 text-brand-success" />;
      case "draft":
        return <Circle className="h-5 w-5 text-brand-gold" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-brand-success text-white",
      draft: "bg-brand-gold text-white",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium pill-shape ${
          variants[status as keyof typeof variants]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  useEffect(() => {
    let isMounted = true;

    async function loadQuizzes() {
      const result = await graphqlFetch<AdminQuizzesData>({
        query: adminQuizzesQuery,
      });

      if (isMounted) {
        setQuizList(result.quizzes.map(normalizeQuiz));
        setQuizStats(result.quizStats);
        setQuizError(null);
      }
    }

    loadQuizzes().catch((error) => {
      if (isMounted) {
        setQuizList([]);
        setQuizStats(emptyQuizStats);
        setQuizError(
          error instanceof Error ? error.message : "Unable to load quizzes."
        );
      }
    }).finally(() => {
      if (isMounted) {
        setIsLoadingQuizzes(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredQuizzes = useMemo(() => quizList.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.courseTitle && quiz.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [quizList, searchQuery, statusFilter]);

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <Card
      className="cursor-card hover:cursor-card-hover transition-all duration-200 group bg-card rounded-lg"
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle
                className="text-lg font-normal text-foreground"
                style={{ letterSpacing: "-0.11px" }}
              >
                {quiz.title}
              </CardTitle>
              {getStatusIcon(quiz.status)}
            </div>
            <CardDescription
              className="line-clamp-2 text-muted-foreground"
            >
              {quiz.description}
            </CardDescription>
          </div>
          <button className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md opacity-0 group-hover:opacity-100">
            <DotsThreeVertical
              className="h-5 w-5 text-muted-foreground"
            />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              <span>{quiz.questions.length} questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{quiz.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{quiz.attempts} attempts</span>
            </div>
          </div>

          {quiz.courseTitle && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{quiz.courseTitle}</span>
            </div>
          )}

          {quiz.status === "published" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Avg. Score</span>
                <span className="text-muted-foreground">
                  {quiz.avgScore}%
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full bg-surface-100"
              >
                <div
                  className="h-2 rounded-full transition-all duration-200 bg-primary"
                  style={{
                    width: `${quiz.avgScore}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(quiz.status)}
              <span
                className="text-xs text-muted-foreground"
              >
                Updated {quiz.updatedAt}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewQuiz(quiz)}
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="View"
                aria-label={`Preview ${quiz.title}`}
              >
                <Eye
                  className="h-4 w-4 text-muted-foreground"
                />
              </button>
              <a
                href={`/quizzes/${quiz.id}/edit`}
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="Edit"
                aria-label={`Edit ${quiz.title}`}
              >
                <PencilSimple
                  className="h-4 w-4 text-muted-foreground"
                />
              </a>
              <button
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="Delete"
              >
                <Trash
                  className="h-4 w-4 text-muted-foreground"
                />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuizRow = ({ quiz }: { quiz: Quiz }) => (
    <div
      className="flex items-center gap-4 p-4 border-b cursor-btn-hover focus-warm transition-all duration-150 hover:bg-accent border-border/10"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3
            className="font-medium text-foreground"
            style={{ letterSpacing: "-0.11px" }}
          >
            {quiz.title}
          </h3>
          {getStatusIcon(quiz.status)}
        </div>
        <p
          className="text-sm mt-1 line-clamp-1 text-muted-foreground"
        >
          {quiz.description}
        </p>
        {quiz.courseTitle && (
          <div className="flex items-center gap-1.5 text-xs mt-1 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{quiz.courseTitle}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-[90px]">
          <ListChecks className="h-4 w-4" />
          <span>{quiz.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[80px]">
          <Clock className="h-4 w-4" />
          <span>{quiz.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[70px]">
          <Users className="h-4 w-4" />
          <span>{quiz.attempts}</span>
        </div>
        {quiz.status === "published" && (
          <div className="flex items-center gap-2 min-w-[100px]">
            <div className="w-16">
              <div className="h-2 w-full rounded-full bg-surface-100">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${quiz.avgScore}%` }}
                />
              </div>
            </div>
            <span className="min-w-[35px]">{quiz.avgScore}%</span>
          </div>
        )}
        {getStatusBadge(quiz.status)}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreviewQuiz(quiz)}
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="View"
            aria-label={`Preview ${quiz.title}`}
          >
            <Eye
              className="h-4 w-4 text-muted-foreground"
            />
          </button>
          <a
            href={`/quizzes/${quiz.id}/edit`}
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="Edit"
            aria-label={`Edit ${quiz.title}`}
          >
            <PencilSimple
              className="h-4 w-4 text-muted-foreground"
            />
          </a>
          <button
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="Delete"
          >
            <Trash
              className="h-4 w-4 text-muted-foreground"
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-normal tracking-tight text-foreground"
            style={{ letterSpacing: "-0.11px" }}
          >
            Quizzes
          </h1>
          <p className="text-base text-muted-foreground">
            Manage and create quizzes for your courses
          </p>
        </div>
        <Button
          asChild
          className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
        >
          <a href="/quizzes/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-card bg-card rounded-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Total Quizzes
            </CardTitle>
            <Brain
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {quizStats.total}
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-card bg-card rounded-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Published
            </CardTitle>
            <CheckCircle
              className="h-4 w-4 text-brand-success"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {quizStats.published}
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-card bg-card rounded-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Total Attempts
            </CardTitle>
            <Users
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {quizStats.attempts}
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-card bg-card rounded-lg"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Avg. Score
            </CardTitle>
            <TrendUp
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {quizStats.averageScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 ${
              viewMode === "grid"
                ? "bg-primary text-white"
                : "bg-surface-100 text-foreground"
            }`}
          >
            <GridFour className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 ${
              viewMode === "list"
                ? "bg-primary text-white"
                : "bg-surface-100 text-foreground"
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quizzes Display */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-2"
        }`}
      >
        {isLoadingQuizzes ? (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              Loading quizzes
            </h3>
          </div>
        ) : quizError ? (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              Could not load quizzes
            </h3>
            <p>{quizError}</p>
          </div>
        ) : filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) =>
            viewMode === "grid" ? (
              <QuizCard key={quiz.id} quiz={quiz} />
            ) : (
              <QuizRow key={quiz.id} quiz={quiz} />
            )
          )
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              No quizzes found
            </h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredQuizzes.length > 0 && (
        <div className="flex items-center justify-between">
          <p
            className="text-sm text-muted-foreground"
          >
            Showing {filteredQuizzes.length} of {quizList.length} quizzes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled
              className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border-border/10 text-muted-foreground"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled
              className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border-border/10 text-muted-foreground"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {previewQuiz && (
        <QuizPreviewModal
          quiz={previewQuiz}
          isOpen={Boolean(previewQuiz)}
          onClose={() => setPreviewQuiz(null)}
        />
      )}
    </div>
  );
}
