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
  XCircle,
  Brain,
  ListChecks,
  BookOpen,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { QuizPreviewModal } from "./components/QuizPreviewModal";
import type { Quiz } from "./types";
import { graphqlFetch } from "../../lib/graphql/client";
import { adminQuizzesQuery } from "../../lib/graphql/quizzes";

type QuizStats = {
  total: number;
  published: number;
  attempts: number;
  averageScore: number;
};

type GraphqlQuiz = Omit<Quiz, "status" | "questions"> & {
  status: Uppercase<Quiz["status"]>;
  questions: Array<
    Omit<Quiz["questions"][number], "correctAnswer"> & {
      correctAnswer?: string | null;
    }
  >;
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

const parseCorrectAnswer = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value as number | number[];
  }

  const parsed = JSON.parse(value) as number | number[];

  return parsed;
};

const normalizeQuiz = (quiz: GraphqlQuiz): Quiz => ({
  ...quiz,
  status: quiz.status.toLowerCase() as Quiz["status"],
  questions: quiz.questions.map((question) => ({
    ...question,
    correctAnswer: parseCorrectAnswer(question.correctAnswer),
  })),
});

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
      case "archived":
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-brand-success text-white",
      draft: "bg-brand-gold text-white",
      archived: "bg-muted text-muted-foreground",
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
          <option value="archived">Archived</option>
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
