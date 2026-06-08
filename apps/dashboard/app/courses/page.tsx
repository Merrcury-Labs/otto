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
  FileText,
  TrendUp,
  Clock,
  DotsThreeVertical,
  CheckCircle,
  Circle,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import { CoursePreviewModal } from "./components/CoursePreviewModal";
import { courses } from "./data";
import type { Course } from "./types";

export default function CoursesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("published");
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

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

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="cursor-card hover:cursor-card-hover transition-all duration-200 group bg-card rounded-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle
                className="text-lg font-normal text-foreground"
                style={{ letterSpacing: "-0.11px" }}
              >
                {course.title}
              </CardTitle>
              {getStatusIcon(course.status)}
            </div>
            <CardDescription className="line-clamp-2 text-muted-foreground">
              {course.description}
            </CardDescription>
          </div>
          <button className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md opacity-0 group-hover:opacity-100">
            <DotsThreeVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{course.students} students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{course.quizzes} quizzes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">Progress</span>
              <span className="text-muted-foreground">
                {course.progress}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-100">
              <div
                className="h-2 rounded-full transition-all duration-200 bg-primary"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {getStatusBadge(course.status)}
              <span className="text-xs text-muted-foreground">
                Updated {course.updatedAt}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewCourse(course)}
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="View"
                aria-label={`Preview ${course.title}`}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
              </button>
              <a
                href={`/courses/${course.id}/edit`}
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="Edit"
                aria-label={`Edit ${course.title}`}
              >
                <PencilSimple className="h-4 w-4 text-muted-foreground" />
              </a>
              <button
                className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                title="Delete"
              >
                <Trash className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CourseRow = ({ course }: { course: Course }) => (
    <div
      className="flex items-center gap-4 p-4 border-b cursor-btn-hover focus-warm transition-all duration-150 hover:bg-accent border-border/10"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3
            className="font-medium text-foreground"
            style={{ letterSpacing: "-0.11px" }}
          >
            {course.title}
          </h3>
          {getStatusIcon(course.status)}
        </div>
        <p className="text-sm mt-1 line-clamp-1 text-muted-foreground">
          {course.description}
        </p>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-[80px]">
          <Users className="h-4 w-4" />
          <span>{course.students}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[70px]">
          <FileText className="h-4 w-4" />
          <span>{course.quizzes}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[60px]">
          <Clock className="h-4 w-4" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24">
            <div className="h-2 w-full rounded-full bg-surface-100">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
          <span className="min-w-[35px]">{course.progress}%</span>
        </div>
        {getStatusBadge(course.status)}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreviewCourse(course)}
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="View"
            aria-label={`Preview ${course.title}`}
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
          <a
            href={`/courses/${course.id}/edit`}
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="Edit"
            aria-label={`Edit ${course.title}`}
          >
            <PencilSimple className="h-4 w-4 text-muted-foreground" />
          </a>
          <button
            className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
            title="Delete"
          >
            <Trash className="h-4 w-4 text-muted-foreground" />
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
            Courses
          </h1>
          <p className="text-base text-muted-foreground">
            Manage and create your educational content
          </p>
        </div>
        <Button
          asChild
          className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
        >
          <a href="/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-card bg-card rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Total Courses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {courses.length}
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-card bg-card rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Published
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {courses.filter((c) => c.status === "published").length}
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-card bg-card rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {courses.reduce((acc, course) => acc + course.students, 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-card bg-card rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle
              className="text-sm font-medium text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Avg. Progress
            </CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-normal text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              {Math.round(
                courses.reduce((acc, course) => acc + course.progress, 0) /
                  courses.length
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
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

      {/* Courses Display */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-2"
        }`}
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) =>
            viewMode === "grid" ? (
              <CourseCard key={course.id} course={course} />
            ) : (
              <CourseRow key={course.id} course={course} />
            )
          )
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">
              No courses found
            </h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCourses.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
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

      {previewCourse && (
        <CoursePreviewModal
          course={previewCourse}
          isOpen={Boolean(previewCourse)}
          onClose={() => setPreviewCourse(null)}
        />
      )}
    </div>
  );
}
