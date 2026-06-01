"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
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
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import LessonModal, { LessonFormData } from "../../components/LessonModal";
import { CoursePreviewModal } from "../../components/CoursePreviewModal";
import { getCourseById } from "../../data";
import type { CourseFormData, CourseStatus, Lesson } from "../../types";

function getLessonIcon(type: Lesson["type"]) {
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "quiz") return <Check className="h-4 w-4" />;
  if (type === "code") return <Code className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);
  const course = getCourseById(courseId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const initialFormData = useMemo<CourseFormData | null>(() => {
    if (!course) return null;

    return {
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      prerequisites: course.prerequisites,
      tags: course.tags,
      modules: course.modules,
    };
  }, [course]);

  const [formData, setFormData] = useState<CourseFormData | null>(
    initialFormData
  );
  const [status, setStatus] = useState<CourseStatus>(
    course?.status || "draft"
  );
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [lessonType, setLessonType] = useState<Lesson["type"]>("video");

  if (!course || !formData) {
    return (
      <div className="space-y-6 px-4">
        <Button
          variant="ghost"
          className="cursor-btn-hover focus-warm transition-all duration-150"
          style={{ color: "#26251e" }}
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}>
          <CardContent className="py-12 text-center">
            <FileText
              className="h-12 w-12 mx-auto mb-4"
              style={{ color: "rgba(38, 37, 30, 0.4)" }}
            />
            <h1 className="text-xl font-medium" style={{ color: "#26251e" }}>
              Course not found
            </h1>
            <p
              className="mt-2"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            >
              This course may have been deleted or moved.
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

  const removeModule = (moduleId: number) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((module) => module.id !== moduleId),
    });
  };

  const updateModuleTitle = (moduleId: number, title: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId ? { ...module, title } : module
      ),
    });
  };

  const openLessonModal = (moduleId: number, type: Lesson["type"]) => {
    setCurrentModuleId(moduleId);
    setLessonType(type);
    setIsLessonModalOpen(true);
  };

  const getLessonTypeLabel = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return "Video";
      case "text":
        return "Reading";
      case "quiz":
        return "Quiz";
      case "code":
        return "Exercise";
      default:
        return "Lesson";
    }
  };

  const handleLessonSave = (data: LessonFormData) => {
    const currentModule = formData.modules.find(
      (module) => module.id === currentModuleId
    );
    if (!currentModule) return;

    const newLesson: Lesson = {
      id: Date.now(),
      title:
        data.title ||
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
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      ),
    });

    setIsLessonModalOpen(false);
    setCurrentModuleId(null);
  };

  const removeLesson = (moduleId: number, lessonId: number) => {
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
    moduleId: number,
    lessonId: number,
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
    moduleId: number,
    lessonId: number,
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

  const handleThumbnailUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((currentData) =>
          currentData ? { ...currentData, thumbnail: reader.result as string } : null
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Updating course:", {
      id: course.id,
      status,
      ...formData,
    });
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="cursor-btn-hover focus-warm transition-all duration-150"
            style={{ color: "#26251e" }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1
              className="text-3xl font-normal tracking-tight"
              style={{ color: "#26251e", letterSpacing: "-0.11px" }}
            >
              Edit Course
            </h1>
            <p
              className="text-base"
              style={{ color: "rgba(38, 37, 30, 0.55)" }}
            >
              Update the course details students and admins see
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="cursor-btn-hover focus-warm transition-all duration-150"
          style={{
            backgroundColor: "#ebeae5",
            color: "#26251e",
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: "#f7f7f4" }}
              >
                <BookOpen className="h-5 w-5" style={{ color: "#26251e" }} />
              </div>
              <div>
                <CardTitle
                  className="text-xl font-normal"
                  style={{ color: "#26251e", letterSpacing: "-0.11px" }}
                >
                  Course Information
                </CardTitle>
                <CardDescription style={{ color: "rgba(38, 37, 30, 0.55)" }}>
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
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#26251e" }}
                  >
                    Course Title
                  </label>
                  <input
                    value={formData.title}
                    onChange={(event) =>
                      setFormData({ ...formData, title: event.target.value })
                    }
                    className="w-full rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150"
                    style={{
                      backgroundColor: "#f7f7f4",
                      borderColor: "rgba(38, 37, 30, 0.1)",
                      color: "#26251e",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#26251e" }}
                  >
                    Course Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        description: event.target.value,
                      })
                    }
                    rows={5}
                    className="w-full resize-none rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150"
                    style={{
                      backgroundColor: "#f7f7f4",
                      borderColor: "rgba(38, 37, 30, 0.1)",
                      color: "#26251e",
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className="block text-sm font-medium"
                  style={{ color: "#26251e" }}
                >
                  Thumbnail
                </label>
                <div
                  className="overflow-hidden rounded-lg border"
                  style={{
                    backgroundColor: "#f7f7f4",
                    borderColor: "rgba(38, 37, 30, 0.1)",
                  }}
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
                        className="h-8 w-8"
                        style={{ color: "rgba(38, 37, 30, 0.35)" }}
                      />
                    </div>
                  )}
                </div>
                <label
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-md px-4 py-2 text-sm transition-all duration-150"
                  style={{
                    backgroundColor: "#ebeae5",
                    color: "#26251e",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleThumbnailUpload(event.target.files?.[0] || null)
                    }
                  />
                  Replace Thumbnail
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#26251e" }}
                >
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as CourseStatus)}
                  className="w-full rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150"
                  style={{
                    backgroundColor: "#f7f7f4",
                    borderColor: "rgba(38, 37, 30, 0.1)",
                    color: "#26251e",
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#26251e" }}
                >
                  Tags
                </label>
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "rgba(38, 37, 30, 0.45)" }}
                  />
                  <input
                    value={formData.tags.join(", ")}
                    onChange={(event) => updateTags(event.target.value)}
                    className="w-full rounded-md py-3 pl-10 pr-4 cursor-btn-hover focus-warm transition-all duration-150"
                    style={{
                      backgroundColor: "#f7f7f4",
                      borderColor: "rgba(38, 37, 30, 0.1)",
                      color: "#26251e",
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#26251e" }}
              >
                Prerequisites
              </label>
              <textarea
                value={formData.prerequisites.join("\n")}
                onChange={(event) => updatePrerequisites(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-md px-4 py-3 cursor-btn-hover focus-warm transition-all duration-150"
                style={{
                  backgroundColor: "#f7f7f4",
                  borderColor: "rgba(38, 37, 30, 0.1)",
                  color: "#26251e",
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#f7f7f4" }}
                >
                  <FileText className="h-5 w-5" style={{ color: "#26251e" }} />
                </div>
                <div>
                  <CardTitle
                    className="text-xl font-normal"
                    style={{ color: "#26251e", letterSpacing: "-0.11px" }}
                  >
                    Course Structure
                  </CardTitle>
                  <CardDescription style={{ color: "rgba(38, 37, 30, 0.55)" }}>
                    Organize your course into modules and lessons
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                onClick={addModule}
                className="cursor-btn-hover focus-warm transition-all duration-150"
                style={{
                  backgroundColor: "#ebeae5",
                  color: "#26251e",
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.modules.length === 0 ? (
              <div
                className="text-center py-12 border-2 border-dashed rounded-lg"
                style={{ borderColor: "rgba(38, 37, 30, 0.2)" }}
              >
                <FileText
                  className="h-12 w-8 mx-auto mb-4"
                  style={{ color: "rgba(38, 37, 30, 0.4)" }}
                />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: "#26251e" }}
                >
                  No modules yet
                </h3>
                <p className="mb-4" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
                  Start by creating your first module to structure your course
                </p>
                <Button
                  type="button"
                  onClick={addModule}
                  className="cursor-btn-hover focus-warm transition-all duration-150"
                  style={{
                    backgroundColor: "#ebeae5",
                    color: "#26251e",
                  }}
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
                    className="border rounded-lg p-4"
                    style={{
                      backgroundColor: "#f7f7f4",
                      borderColor: "rgba(38, 37, 30, 0.1)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div
                          className="text-xs font-medium mb-1"
                          style={{ color: "rgba(38, 37, 30, 0.55)" }}
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
                          className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            borderColor: "rgba(38, 37, 30, 0.1)",
                            color: "#26251e",
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeModule(module.id)}
                        className="cursor-btn-hover focus-warm transition-all duration-150"
                        style={{ color: "#cf2d56" }}
                        aria-label={`Remove module ${moduleIndex + 1}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    {module.lessons.length > 0 && (
                      <div className="space-y-2 mb-4 ml-8">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                            style={{
                              backgroundColor: "#ebeae5",
                              borderColor: "rgba(38, 37, 30, 0.1)",
                            }}
                          >
                            <SplitVerticalIcon
                              className="h-4 w-4 cursor-move"
                              style={{ color: "rgba(38, 37, 30, 0.4)" }}
                            />
                            <div
                              className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium pill-shape"
                              style={{
                                backgroundColor: "#f7f7f4",
                                color: "#26251e",
                              }}
                            >
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
                                className="rounded-md px-3 py-2 cursor-btn-hover focus-warm transition-all duration-150"
                                style={{
                                  backgroundColor: "#f7f7f4",
                                  borderColor: "rgba(38, 37, 30, 0.1)",
                                  color: "#26251e",
                                }}
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
                                className="rounded-md px-3 py-2 cursor-btn-hover focus-warm transition-all duration-150"
                                style={{
                                  backgroundColor: "#f7f7f4",
                                  borderColor: "rgba(38, 37, 30, 0.1)",
                                  color: "#26251e",
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removeLesson(module.id, lesson.id)}
                              className="cursor-btn-hover focus-warm transition-all duration-150"
                              style={{ color: "#cf2d56" }}
                              aria-label={`Remove ${lesson.title}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 ml-8">
                      <button
                        type="button"
                        onClick={() => openLessonModal(module.id, "video")}
                        className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
                        style={{
                          backgroundColor: "#e6e5e0",
                          color: "#26251e",
                        }}
                      >
                        <Video className="h-4 w-4" />
                        Add Video
                      </button>
                      <button
                        type="button"
                        onClick={() => openLessonModal(module.id, "text")}
                        className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
                        style={{
                          backgroundColor: "#e6e5e0",
                          color: "#26251e",
                        }}
                      >
                        <FileText className="h-4 w-4" />
                        Add Reading
                      </button>
                      <button
                        type="button"
                        onClick={() => openLessonModal(module.id, "quiz")}
                        className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
                        style={{
                          backgroundColor: "#e6e5e0",
                          color: "#26251e",
                        }}
                      >
                        <Check className="h-4 w-4" />
                        Add Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => openLessonModal(module.id, "code")}
                        className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
                        style={{
                          backgroundColor: "#e6e5e0",
                          color: "#26251e",
                        }}
                      >
                        <Code className="h-4 w-4" />
                        Add Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="cursor-btn-hover focus-warm transition-all duration-150"
            style={{
              backgroundColor: "#f7f7f4",
              borderColor: "rgba(38, 37, 30, 0.1)",
              color: "#26251e",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="cursor-btn-hover focus-warm transition-all duration-150"
            style={{
              backgroundColor: "#ebeae5",
              color: "#26251e",
            }}
          >
            Save Changes
          </Button>
        </div>
      </form>

      <LessonModal
        isOpen={isLessonModalOpen}
        lessonType={lessonType}
        onSave={handleLessonSave}
        onClose={() => {
          setIsLessonModalOpen(false);
          setCurrentModuleId(null);
        }}
      />

      <CoursePreviewModal
        course={formData}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
