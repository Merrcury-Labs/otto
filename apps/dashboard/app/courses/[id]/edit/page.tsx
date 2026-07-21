"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { OttoEditor } from "@repo/editor";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Code,
  Eye,
  FileText,
  Plus,
  SplitVerticalIcon,
  Tag,
  Trash,
  Video,
  X,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import LessonModal, {
  LessonFormData,
} from "../../components/LessonModal";
import type { CourseFormData, CourseStatus, Lesson } from "../../types";
import {
  type AdminCoursesData,
  getCourseFormData,
  getLessonTypeLabel,
} from "../../utils";
import { graphqlFetch } from "../../../../lib/graphql/client";
import { adminCoursesQuery } from "../../../../lib/graphql/courses";
import { saveCourse } from "../../persistence";
import { uploadThumbnail } from "../../../../lib/course-thumbnail";

function getLessonIcon(type: Lesson["type"]) {
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "quiz") return <Check className="h-4 w-4" />;
  if (type === "code") return <Code className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData | null>(null);
  const [status, setStatus] = useState<CourseStatus>("published");
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<
    Lesson["id"] | null
  >(null);
  const [lessonType, setLessonType] = useState<Lesson["type"]>("video");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      const result = await graphqlFetch<AdminCoursesData>({
        query: adminCoursesQuery,
      });
      const course = result.courses.find(
        (item) => String(item.id) === params.id
      );

      if (!isMounted) return;

      if (!course) {
        setFormData(null);
        setCourseError("Course not found.");
        return;
      }

      setFormData(getCourseFormData(course));
      setStatus("published");
      setCourseError(null);
    }

    setIsLoadingCourse(true);
    loadCourse()
      .catch((error) => {
        if (isMounted) {
          setFormData(null);
          setCourseError(
            error instanceof Error ? error.message : "Unable to load course."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCourse(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (isLoadingCourse) {
    return (
      <div className="space-y-6 px-4">
        <Card className="bg-card rounded-lg">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-medium text-foreground">
              Loading course
            </h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="space-y-6 px-4">
        <Button
          variant="ghost"
          className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-card rounded-lg">
          <CardContent className="py-12 text-center">
            <FileText
              className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
            />
            <h1 className="text-xl font-medium text-foreground">
              Course not found
            </h1>
            <p
              className="mt-2 text-muted-foreground"
            >
              {courseError || "This course may have been deleted or moved."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateTags = (value: string) => {
    setFormData({
      ...formData,
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  const updatePrerequisites = (value: string) => {
    setFormData({
      ...formData,
      prerequisites: value
        .split("\n")
        .map((prerequisite) => prerequisite.trim())
        .filter(Boolean),
    });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          id: Date.now(),
          title: "",
          lessons: [],
        },
      ],
    });
  };

  const removeModule = (moduleId: Lesson["id"]) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((module) => module.id !== moduleId),
    });
  };

  const updateModuleTitle = (moduleId: Lesson["id"], title: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId ? { ...module, title } : module
      ),
    });
  };

  const openLessonModal = (moduleId: Lesson["id"], type: Lesson["type"]) => {
    setCurrentModuleId(moduleId);
    setLessonType(type);
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const openReadingEditor = (moduleId: Lesson["id"], lesson: Lesson) => {
    setCurrentModuleId(moduleId);
    setLessonType("text");
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleLessonSave = (data: LessonFormData) => {
    const currentModule = formData.modules.find(
      (module) => module.id === currentModuleId
    );
    if (!currentModule) return;

    const newLesson: Lesson = {
      id: editingLesson?.id ?? Date.now(),
      title:
        data.title ||
        editingLesson?.title ||
        `${getLessonTypeLabel(data.type)} ${currentModule.lessons.length + 1}`,
      type: data.type,
      duration: data.duration || "",
    };

    if (data.type === "video" && data.url) {
      newLesson.url = data.url;
    }
    if ((data.type === "text" || data.type === "code") && data.content) {
      newLesson.content = data.content;
    }
    if (data.type === "quiz" && data.questions) {
      newLesson.questions = data.questions;
    }

    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === currentModuleId
          ? {
              ...module,
              lessons: editingLesson
                ? module.lessons.map((lesson) =>
                    lesson.id === editingLesson.id ? newLesson : lesson,
                  )
                : [...module.lessons, newLesson],
            }
          : module
      ),
    });

    setIsLessonModalOpen(false);
    setCurrentModuleId(null);
    setEditingLesson(null);
  };

  const removeLesson = (moduleId: Lesson["id"], lessonId: Lesson["id"]) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
            }
          : module
      ),
    });
  };

  const updateLessonTitle = (
    moduleId: Lesson["id"],
    lessonId: Lesson["id"],
    title: string
  ) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, title } : lesson
              ),
            }
          : module
      ),
    });
  };

  const updateLessonDuration = (
    moduleId: Lesson["id"],
    lessonId: Lesson["id"],
    duration: string
  ) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, duration } : lesson
              ),
            }
          : module
      ),
    });
  };

  const handleThumbnailUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploadingThumbnail(true);
    setThumbnailError(null);
    try {
      const thumbnail = await uploadThumbnail(file);
      setFormData((currentData) =>
        currentData ? { ...currentData, thumbnail } : null,
      );
    } catch (error) {
      setThumbnailError(
        error instanceof Error ? error.message : "Unable to upload thumbnail.",
      );
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData) return;

    setIsSavingCourse(true);
    setSaveError(null);

    try {
      await saveCourse(formData, {
        id: params.id,
        status,
      });
      router.push("/courses");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to update course."
      );
    } finally {
      setIsSavingCourse(false);
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-normal tracking-tight text-foreground"
              style={{ letterSpacing: "-0.11px" }}
            >
              Edit Course
            </h1>
            <p
              className="text-base text-muted-foreground"
            >
              Update the course details students and admins see
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => router.push(`/courses/${params.id}/preview`)}
          className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card rounded-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100"
              >
                <BookOpen className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <CardTitle
                  className="text-xl font-normal text-foreground"
                  style={{ letterSpacing: "-0.11px" }}
                >
                  Course Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Core details and publishing state
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Course Title
                  </label>
                  <input
                    value={formData.title}
                    onChange={(event) =>
                      setFormData({ ...formData, title: event.target.value })
                    }
                    className="w-full rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Course Description
                  </label>
                  <OttoEditor
                    content={formData.description}
                    onChange={(json) =>
                      setFormData({
                        ...formData,
                        description: json,
                      })
                    }
                    placeholder="Describe what students will learn in this course"
                    showToolbar
                    minHeight="120px"
                    aiEnabled
                    format="auto"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className="block text-sm font-medium text-foreground"
                >
                  Thumbnail
                </label>
                <div
                  className="overflow-hidden rounded-lg border bg-surface-100 border-border/10"
                >
                  {formData.thumbnail ? (
                    <Image
                      src={formData.thumbnail}
                      alt="Course thumbnail"
                      className="h-36 w-full object-cover"
                      width={440}
                      height={288}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center">
                      <BookOpen
                        className="h-8 w-8 text-muted-foreground"
                      />
                    </div>
                  )}
                </div>
                <label
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm transition-all duration-150 bg-surface-300 text-foreground"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingThumbnail}
                    onChange={(event) =>
                      handleThumbnailUpload(event.target.files?.[0] || null)
                    }
                  />
                  {isUploadingThumbnail ? "Uploading..." : "Replace Thumbnail"}
                </label>
                {thumbnailError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {thumbnailError}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, or WebP. Maximum 5MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as CourseStatus)}
                  className="w-full rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Tags
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={formData.tags.join(", ")}
                    onChange={(event) => updateTags(event.target.value)}
                    className="w-full rounded-md py-3 pl-10 pr-4 cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites.join("\n")}
                onChange={(event) => updatePrerequisites(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100"
                >
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <CardTitle
                    className="text-xl font-normal text-foreground"
                    style={{ letterSpacing: "-0.11px" }}
                  >
                    Course Structure
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Organize your course into modules and lessons
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                onClick={addModule}
                className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.modules.length === 0 ? (
              <div
                className="text-center py-12 border-2 border-dashed rounded-lg border-border/10"
              >
                <FileText
                  className="h-12 w-8 mx-auto mb-4 text-muted-foreground"
                />
                <h3
                  className="text-lg font-medium mb-2 text-foreground"
                >
                  No modules yet
                </h3>
                <p className="mb-4 text-muted-foreground">
                  Start by creating your first module to structure your course
                </p>
                <Button
                  type="button"
                  onClick={addModule}
                  className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.modules.map((module, moduleIndex) => (
                  <div
                    key={module.id}
                    className="border rounded-lg p-4 bg-surface-100 border-border/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div
                          className="text-xs font-medium mb-1 text-muted-foreground"
                        >
                          Module {moduleIndex + 1}
                        </div>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(event) =>
                            updateModuleTitle(module.id, event.target.value)
                          }
                          placeholder={`Module ${moduleIndex + 1} Title`}
                          className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeModule(module.id)}
                        className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                        aria-label={`Remove module ${moduleIndex + 1}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="ml-8 border-l-2 border-border/20 pl-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-xs font-medium uppercase text-muted-foreground">
                          Lessons
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {module.lessons.length}
                        </div>
                      </div>

                      {module.lessons.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 rounded-lg border bg-surface-300 p-3 border-border/10"
                            >
                              <SplitVerticalIcon className="h-4 w-4 cursor-move text-muted-foreground" />
                              <div className="flex items-center gap-2 rounded px-2 py-1 text-xs font-medium pill-shape bg-surface-100 text-foreground">
                                {getLessonIcon(lesson.type)}
                                {getLessonTypeLabel(lesson.type)}
                              </div>
                              <div className="grid flex-1 gap-2 md:grid-cols-[1fr_140px]">
                                <input
                                  value={lesson.title}
                                  onChange={(event) =>
                                    updateLessonTitle(
                                      module.id,
                                      lesson.id,
                                      event.target.value
                                    )
                                  }
                                  className="rounded-md px-3 py-2 cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                                />
                                <input
                                  value={lesson.duration || ""}
                                  onChange={(event) =>
                                    updateLessonDuration(
                                      module.id,
                                      lesson.id,
                                      event.target.value
                                    )
                                  }
                                  placeholder="Duration"
                                  className="rounded-md px-3 py-2 cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                                />
                              </div>
                              {lesson.type === "text" ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => openReadingEditor(module.id, lesson)}
                                  aria-label={`Edit ${lesson.title}`}
                                  className="cursor-btn-hover focus-warm transition-all duration-150 text-foreground"
                                >
                                  <PencilSimple className="h-4 w-4" />
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeLesson(module.id, lesson.id)}
                                className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                                aria-label={`Remove ${lesson.title}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openLessonModal(module.id, "video")}
                          className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm bg-card text-foreground"
                        >
                          <Video className="h-4 w-4" />
                          Add Video
                        </button>
                        <button
                          type="button"
                          onClick={() => openLessonModal(module.id, "text")}
                          className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm bg-card text-foreground"
                        >
                          <FileText className="h-4 w-4" />
                          Add Reading
                        </button>
                        <button
                          type="button"
                          onClick={() => openLessonModal(module.id, "quiz")}
                          className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm bg-card text-foreground"
                        >
                          <Check className="h-4 w-4" />
                          Add Quiz
                        </button>
                        <button
                          type="button"
                          onClick={() => openLessonModal(module.id, "code")}
                          className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm bg-card text-foreground"
                        >
                          <Code className="h-4 w-4" />
                          Add Exercise
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {saveError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSavingCourse || isUploadingThumbnail}
            className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
          >
            {isSavingCourse ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <LessonModal
        isOpen={isLessonModalOpen}
        lessonType={lessonType}
        initialData={
          editingLesson
            ? {
                title: editingLesson.title,
                type: editingLesson.type,
                duration: editingLesson.duration ?? "",
                content: editingLesson.content ?? "",
              }
            : null
        }
        onSave={handleLessonSave}
        onClose={() => {
          setIsLessonModalOpen(false);
          setCurrentModuleId(null);
          setEditingLesson(null);
        }}
      />
    </div>
  );
}
