"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OttoEditor } from "@repo/editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ArrowLeft,
  Plus,
  Trash,
  SplitVerticalIcon,
  FileText,
  Video,
  Code,
  Check,
  BookOpen,
  Tag,
  X,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";
import LessonModal, { LessonFormData } from "../components/LessonModal";
import { CoursePreviewModal } from "../components/CoursePreviewModal";
import type { CourseFormData, CourseModule as Module, Lesson } from "../types";
import { saveCourse } from "../persistence";
import { uploadThumbnail } from "../../../lib/course-thumbnail";

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    thumbnail: "",
    prerequisites: [],
    tags: [],
    modules: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<
    Module["id"] | null
  >(null);
  const [lessonType, setLessonType] = useState<Lesson["type"]>("video");
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  const availableTags = [
    "React",
    "TypeScript",
    "JavaScript",
    "Next.js",
    "Node.js",
    "Python",
    "SQL",
    "Data Structures",
    "Algorithms",
    "Web Development",
    "Backend",
    "Frontend",
    "Full Stack",
    "DevOps",
    "UI/UX",
    "Mobile",
    "AI/ML",
    "Database",
    "API",
  ];

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now(),
      title: "",
      lessons: [],
    };
    setFormData({
      ...formData,
      modules: [...formData.modules, newModule],
    });
  };

  const addPrerequisite = (prerequisite: string) => {
    const normalizedPrerequisite = prerequisite.trim();
    if (!normalizedPrerequisite) return;
    if (!formData.prerequisites.includes(normalizedPrerequisite)) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, normalizedPrerequisite],
      });
    }
    setPrerequisiteInput("");
  };

  const removePrerequisite = (prerequisiteToRemove: string) => {
    setFormData({
      ...formData,
      prerequisites: formData.prerequisites.filter(
        (prerequisite) => prerequisite !== prerequisiteToRemove
      ),
    });
  };

  const removeModule = (moduleId: Module["id"]) => {
    setFormData({
      ...formData,
      modules: formData.modules.filter((module) => module.id !== moduleId),
    });
  };

  const updateModuleTitle = (moduleId: Module["id"], title: string) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId ? { ...module, title } : module
      ),
    });
  };

  const openLessonModal = (moduleId: Module["id"], type: Lesson["type"]) => {
    setCurrentModuleId(moduleId);
    setLessonType(type);
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const openReadingEditor = (moduleId: Module["id"], lesson: Lesson) => {
    setCurrentModuleId(moduleId);
    setLessonType("text");
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const removeLesson = (moduleId: Module["id"], lessonId: Lesson["id"]) => {
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

  const handleThumbnailUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploadingThumbnail(true);
    setThumbnailError(null);
    try {
      const thumbnail = await uploadThumbnail(file);
      setFormData((currentData) => ({ ...currentData, thumbnail }));
    } catch (error) {
      setThumbnailError(
        error instanceof Error ? error.message : "Unable to upload thumbnail.",
      );
    } finally {
      setIsUploadingThumbnail(false);
    }
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

  const handleModalSave = (data: LessonFormData) => {
    const currentModule = formData.modules.find((m) => m.id === currentModuleId);
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
    if (data.type === "text" && data.content) {
      newLesson.content = data.content;
    }
    if (data.type === "quiz" && data.questions) {
      newLesson.questions = data.questions;
    }
    if (data.type === "code" && data.content) {
      newLesson.content = data.content;
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

    setIsModalOpen(false);
    setCurrentModuleId(null);
    setEditingLesson(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSavingCourse(true);
    setSaveError(null);

    try {
      await saveCourse(formData, {
        status: "draft",
      });
      router.push("/courses");
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to create course."
      );
    } finally {
      setIsSavingCourse(false);
    }
  };

  const totalLessons = formData.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  const isCourseReady = Boolean(
    formData.title && formData.description && formData.thumbnail
  );

  return (
    <div className="space-y-6 px-4">
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
            Create Course
          </h1>
          <p className="text-base text-muted-foreground">
            Design and structure your new educational course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200 bg-card rounded-lg"
        >
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
                  Basic details about your course
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Course Thumbnail *
              </label>
              <div className="space-y-3">
                <div
                  className="overflow-hidden rounded-lg border bg-surface-100 border-border/10"
                >
                  {formData.thumbnail ? (
                    <Image
                      src={formData.thumbnail}
                      alt="Course thumbnail preview"
                      className="h-48 w-full object-cover"
                      width={1024}
                      height={384}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center">
                      <div className="text-center">
                        <BookOpen
                          className="h-8 w-8 mx-auto mb-3 text-muted-foreground"
                        />
                        <p
                          className="text-sm text-muted-foreground"
                        >
                          Upload a thumbnail students will see before enrolling
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className="inline-flex cursor-pointer items-center rounded-md px-4 py-2 text-sm transition-all duration-150 bg-surface-300 text-foreground"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingThumbnail}
                      onChange={(e) =>
                        handleThumbnailUpload(e.target.files?.[0] || null)
                      }
                    />
                    {isUploadingThumbnail
                      ? "Uploading..."
                      : formData.thumbnail
                        ? "Replace Thumbnail"
                        : "Upload Thumbnail"}
                  </label>
                  {formData.thumbnail && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData((currentData) => ({
                          ...currentData,
                          thumbnail: "",
                        }))
                      }
                      className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                    >
                      Remove
                    </Button>
                  )}
                </div>
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

            <div>
              <label
                className="block text-sm font-medium mb-2 text-foreground"
              >
                Course Prerequisites
              </label>
              <div className="space-y-3">
                {formData.prerequisites.length > 0 && (
                  <div className="space-y-2">
                    {formData.prerequisites.map((prerequisite) => (
                      <div
                        key={prerequisite}
                        className="flex items-center justify-between rounded-md px-3 py-2 bg-surface-300 text-foreground"
                      >
                        <span className="text-sm">{prerequisite}</span>
                        <button
                          type="button"
                          onClick={() => removePrerequisite(prerequisite)}
                          className="transition-colors text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prerequisiteInput}
                    onChange={(e) => setPrerequisiteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPrerequisite(prerequisiteInput);
                      }
                    }}
                    placeholder="Add a prerequisite, e.g. Basic JavaScript knowledge"
                    className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={() => addPrerequisite(prerequisiteInput)}
                    className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Course Title *
                </label>
              <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                  className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                  required
              />
            </div>

            <div>
              <label
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Course Description *
                </label>
              <OttoEditor
                  content={formData.description}
                  onChange={(json) => setFormData({ ...formData, description: json })}
                  placeholder="Describe what students will learn in this course"
                  showToolbar
                  minHeight="120px"
                  aiEnabled
                  format="auto"
              />
            </div>

            <div>
              <label
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Tags
                </label>
              <div className="space-y-3">
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
                      >
                        <Tag className="h-3.5 w-3.5" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600 transition-colors text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Type to search or add tags..."
                    className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
                  />
                  {tagInput && (
                    <div
                      className="border rounded-md p-3 mt-2 max-h-48 overflow-y-auto bg-surface-100 border-border/10"
                    >
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter(
                            (tag) =>
                              tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                              !formData.tags.includes(tag)
                          )
                          .slice(0, 8)
                          .map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="px-3 py-1.5 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm bg-card text-foreground"
                            >
                              +{tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200 bg-card rounded-lg"
        >
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
                <div>
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
                          onChange={(e) =>
                            updateModuleTitle(module.id, e.target.value)
                          }
                          placeholder={`Module ${moduleIndex + 1} Title`}
                          className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 bg-card border border-border/10 text-foreground"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeModule(module.id)}
                          className="cursor-btn-hover focus-warm transition-all duration-150 text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
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
                                {lesson.type === "video" && <Video className="h-4 w-4" />}
                                {lesson.type === "text" && <FileText className="h-4 w-4" />}
                                {lesson.type === "quiz" && <Check className="h-4 w-4" />}
                                {lesson.type === "code" && <Code className="h-4 w-4" />}
                                {lesson.title}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">
                                  {lesson.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {lesson.duration && (
                                    <span className="block mb-1">{lesson.duration}</span>
                                  )}
                                  {lesson.type === "video" && lesson.url && (
                                    <span className="truncate block">{lesson.url}</span>
                                  )}
                                  {lesson.type === "text" && lesson.content && (
                                    <span className="truncate block">{lesson.content.substring(0, 50)}...</span>
                                  )}
                                  {lesson.type === "quiz" && lesson.questions && (
                                    <span className="truncate block">{lesson.questions.length} questions</span>
                                  )}
                                  {lesson.type === "code" && lesson.content && (
                                    <span className="truncate block">{lesson.content.substring(0, 50)}...</span>
                                  )}
                                </div>
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

        {formData.modules.length > 0 && (
          <Card
            className="cursor-card hover:cursor-card-hover transition-all duration-200 bg-card rounded-lg"
          >
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
                    Course Preview
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    See the course the way a student would
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
                >
                  Open Student Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg bg-surface-100"
                >
                  <div
                    className="font-medium mb-2 text-foreground"
                  >
                    {formData.title || "Untitled Course"}
                  </div>
                  <p
                    className="text-sm mb-3 text-muted-foreground"
                  >
                    {formData.description || "Your course description will appear here."}
                  </p>
                  {formData.thumbnail && (
                    <Image
                      src={formData.thumbnail}
                      alt="Course preview thumbnail"
                      className="h-40 w-full rounded-md object-cover mb-3"
                      width={1024}
                      height={320}
                      unoptimized
                    />
                  )}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {formData.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs pill-shape bg-surface-300 text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {formData.tags.length > 3 && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs pill-shape bg-surface-300 text-foreground"
                        >
                          +{formData.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 mb-1">
                      <FileText className="h-4 w-4" />
                      <span>{formData.modules.length} modules</span>
                      <BookOpen className="h-4 w-4" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    {formData.prerequisites.length > 0 && (
                      <div className="rounded-md p-3 bg-surface-300">
                        <div
                          className="text-xs font-medium uppercase tracking-wide mb-2 text-muted-foreground"
                        >
                          Prerequisites
                        </div>
                        <div className="space-y-1">
                          {formData.prerequisites.slice(0, 3).map((prerequisite) => (
                            <div
                              key={prerequisite}
                              className="text-sm text-foreground"
                            >
                              {prerequisite}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      {formData.modules.slice(0, 3).map((module, index) => (
                        <div
                          key={module.id}
                          className="p-3 rounded-md border-l-2 bg-surface-300 border-primary"
                        >
                          <div className="text-sm font-medium mb-1 text-foreground">
                            {module.title || `Module ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {module.lessons.length} lessons
                          </div>
                        </div>
                      ))}
                    {formData.modules.length > 3 && (
                      <div className="text-center py-3 text-muted-foreground">
                        +{formData.modules.length - 3} more modules
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {saveError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => window.history.back()}
            variant="outline"
            className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-100 border border-border/10 text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isCourseReady || isSavingCourse || isUploadingThumbnail}
            className="cursor-btn-hover focus-warm transition-all duration-150 bg-surface-300 text-foreground"
            style={{
              opacity:
                isCourseReady && !isSavingCourse && !isUploadingThumbnail
                  ? 1
                  : 0.6,
              cursor:
                isCourseReady && !isSavingCourse && !isUploadingThumbnail
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {isSavingCourse ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </form>

      <LessonModal
        isOpen={isModalOpen}
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
        onSave={handleModalSave}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentModuleId(null);
          setEditingLesson(null);
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
