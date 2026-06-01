"use client";

import { useState } from "react";
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
import { quizzes } from "./data";
import type { Quiz } from "./types";

export default function QuizzesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-5 w-5" style={{ color: "#1f8a65" }} />;
      case "draft":
        return <Circle className="h-5 w-5" style={{ color: "#c08532" }} />;
      case "archived":
        return <XCircle className="h-5 w-5" style={{ color: "rgba(38, 37, 30, 0.4)" }} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-[#1f8a65] text-white",
      draft: "bg-[#c08532] text-white",
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

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.courseTitle && quiz.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <Card
      className="cursor-card hover:cursor-card-hover transition-all duration-200 group"
      style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle
                className="text-lg font-normal"
                style={{ color: "#26251e", letterSpacing: "-0.11px" }}
              >
                {quiz.title}
              </CardTitle>
              {getStatusIcon(quiz.status)}
            </div>
            <CardDescription
              className="line-clamp-2"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            >
              {quiz.description}
            </CardDescription>
          </div>
          <button className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md opacity-0 group-hover:opacity-100">
            <DotsThreeVertical
              className="h-5 w-5"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
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
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
              <BookOpen className="h-4 w-4" />
              <span>{quiz.courseTitle}</span>
            </div>
          )}

          {quiz.status === "published" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#26251e" }}>Avg. Score</span>
                <span style={{ color: "rgba(38, 37, 30, 0.55)" }}>
                  {quiz.avgScore}%
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full"
                style={{ backgroundColor: "#f7f7f4" }}
              >
                <div
                  className="h-2 rounded-full transition-all duration-200"
                  style={{
                    width: `${quiz.avgScore}%`,
                    backgroundColor: "#26251e",
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(quiz.status)}
              <span
                className="text-xs"
                style={{ color: "rgba(38, 37, 30, 0.55)" }}
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
                  className="h-4 w-4"
                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                />
              </button>
              <a
                href={`/quizzes/${quiz.id}/edit`}
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="Edit"
                aria-label={`Edit ${quiz.title}`}
              >
                <PencilSimple
                  className="h-4 w-4"
                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                />
              </a>
              <button
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="Delete"
              >
                <Trash
                  className="h-4 w-4"
                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
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
      className="flex items-center gap-4 p-4 border-b cursor-btn-hover focus-warm transition-all duration-150 hover:bg-[#ebeae5]"
      style={{ borderColor: "rgba(38, 37, 30, 0.1)" }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3
            className="font-medium"
            style={{ color: "#26251e", letterSpacing: "-0.11px" }}
          >
            {quiz.title}
          </h3>
          {getStatusIcon(quiz.status)}
        </div>
        <p
          className="text-sm mt-1 line-clamp-1"
          style={{ color: "rgba(38, 37, 30, 0.55)" }}
        >
          {quiz.description}
        </p>
        {quiz.courseTitle && (
          <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
            <BookOpen className="h-3.5 w-3.5" />
            <span>{quiz.courseTitle}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
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
              <div className="h-2 w-full rounded-full" style={{ backgroundColor: "#f7f7f4" }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${quiz.avgScore}%`, backgroundColor: "#26251e" }}
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
              className="h-4 w-4"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            />
          </button>
          <a
            href={`/quizzes/${quiz.id}/edit`}
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="Edit"
            aria-label={`Edit ${quiz.title}`}
          >
            <PencilSimple
              className="h-4 w-4"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            />
          </a>
          <button
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="Delete"
          >
            <Trash
              className="h-4 w-4"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
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
            className="text-3xl font-normal tracking-tight"
            style={{ color: "#26251e", letterSpacing: "-0.11px" }}
          >
            Quizzes
          </h1>
          <p className="text-base" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
            Manage and create quizzes for your courses
          </p>
        </div>
        <Button
          asChild
          className="cursor-btn-hover focus-warm transition-all duration-150"
          style={{
            backgroundColor: "#ebeae5",
            color: "#26251e",
          }}
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
          className="cursor-card"
          style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              Total Quizzes
            </CardTitle>
            <Brain
              className="h-4 w-4"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              {quizzes.length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-card"
          style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              Published
            </CardTitle>
            <CheckCircle
              className="h-4 w-4"
              style={{ color: "#1f8a65" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              {quizzes.filter((q) => q.status === "published").length}
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-card"
          style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              Total Attempts
            </CardTitle>
            <Users
              className="h-4 w-4"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              {quizzes.reduce((acc, quiz) => acc + quiz.attempts, 0)}
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-card"
          style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              Avg. Score
            </CardTitle>
            <TrendUp
              className="h-4 w-4"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              {Math.round(
                quizzes
                  .filter((q) => q.status === "published")
                  .reduce((acc, quiz) => acc + quiz.avgScore, 0) /
                  Math.max(quizzes.filter((q) => q.status === "published").length, 1)
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "rgba(38, 37, 30, 0.55)" }}
          />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
            style={{
              backgroundColor: "#f7f7f4",
              borderColor: "rgba(38, 37, 30, 0.1)",
              color: "#26251e",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
          style={{
            backgroundColor: "#f7f7f4",
            borderColor: "rgba(38, 37, 30, 0.1)",
            color: "#26251e",
          }}
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
                ? "bg-[#26251e] text-white"
                : "bg-[#f7f7f4] text-[#26251e]"
            }`}
          >
            <GridFour className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 ${
              viewMode === "list"
                ? "bg-[#26251e] text-white"
                : "bg-[#f7f7f4] text-[#26251e]"
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
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) =>
            viewMode === "grid" ? (
              <QuizCard key={quiz.id} quiz={quiz} />
            ) : (
              <QuizRow key={quiz.id} quiz={quiz} />
            )
          )
        ) : (
          <div className="text-center py-12" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2" style={{ color: "#26251e" }}>
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
            className="text-sm"
            style={{ color: "rgba(38, 37, 30, 0.55)" }}
          >
            Showing {filteredQuizzes.length} of {quizzes.length} quizzes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled
              className="cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#f7f7f4",
                borderColor: "rgba(38, 37, 30, 0.1)",
                color: "rgba(38, 37, 30, 0.4)",
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled
              className="cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#f7f7f4",
                borderColor: "rgba(38, 37, 30, 0.1)",
                color: "rgba(38, 37, 30, 0.4)",
              }}
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
