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
  ArrowLeft,
  Plus,
  Trash,
  SplitVerticalIcon,
  FileText,
  Video,
  Code,
  Check,
  X,
  BookOpen,
  Clock,
  Tag,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  type: "video" | "text" | "quiz" | "code";
  duration?: string;
}

interface CourseFormData {
  title: string;
  description: string;
  tags: string[];
  modules: Module[];
}

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

export default function CreateCoursePage() {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    tags: [],
    modules: [],
  });

  const [tagInput, setTagInput] = useState("");

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

  const addLesson = (moduleId: number, type: Lesson["type"]) => {
    const newLesson: Lesson = {
      id: Date.now(),
      title: "",
      type,
      duration: "",
    };

    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      ),
    });
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

  const updateLesson = (
    moduleId: number,
    lessonId: number,
    updates: Partial<Lesson>
  ) => {
    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              ),
            }
          : module
      ),
    });
  };

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <Check className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating course:", formData);
    // TODO: Implement actual course creation logic
  };

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
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
            Create Course
          </h1>
          <p className="text-base" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
            Design and structure your new educational course
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200"
          style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
        >
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
                  Basic details about your course
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#26251e" }}
              >
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter course title"
                className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
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
                Course Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what students will learn in this course"
                rows={4}
                className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none"
                style={{
                  backgroundColor: "#f7f7f4",
                  borderColor: "rgba(38, 37, 30, 0.1)",
                  color: "#26251e",
                }}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#26251e" }}
              >
                Tags
              </label>
              <div className="space-y-3">
                {/* Selected tags */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm cursor-btn-hover focus-warm transition-all duration-150"
                        style={{
                          backgroundColor: "#ebeae5",
                          color: "#26251e",
                        }}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag input and suggestions */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Type to search or add tags..."
                      className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                      style={{
                        backgroundColor: "#f7f7f4",
                        borderColor: "rgba(38, 37, 30, 0.1)",
                        color: "#26251e",
                      }}
                    />
                  </div>

                  {/* Tag suggestions */}
                  {tagInput && (
                    <div
                      className="border rounded-md p-3 max-h-48 overflow-y-auto"
                      style={{
                        backgroundColor: "#f7f7f4",
                        borderColor: "rgba(38, 37, 30, 0.1)",
                      }}
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
                              className="px-3 py-1.5 rounded-full text-sm cursor-btn-hover focus-warm transition-all duration-150 hover:bg-[#ebeae5]"
                              style={{
                                backgroundColor: "#e6e5e0",
                                color: "#26251e",
                              }}
                            >
                              + {tag}
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

        {/* Course Structure */}
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200"
          style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
        >
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
                  className="h-12 w-12 mx-auto mb-4"
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
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <SplitVerticalIcon
                          className="h-5 w-5 cursor-move"
                          style={{ color: "rgba(38, 37, 30, 0.4)" }}
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) =>
                              updateModuleTitle(module.id, e.target.value)
                            }
                            placeholder={`Module ${moduleIndex + 1} Title`}
                            className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 font-medium"
                            style={{
                              backgroundColor: "#e6e5e0",
                              borderColor: "rgba(38, 37, 30, 0.1)",
                              color: "#26251e",
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeModule(module.id)}
                        className="cursor-btn-hover focus-warm transition-all duration-150"
                        style={{ color: "#cf2d56" }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Lessons */}
                    {module.lessons.length > 0 && (
                      <div className="space-y-2 mb-4 ml-8">
                        {module.lessons.map((lesson, lessonIndex) => (
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
                            <div className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium pill-shape"
                              style={{ backgroundColor: "#f7f7f4", color: "#26251e" }}>
                              {getLessonIcon(lesson.type)}
                              {getLessonTypeLabel(lesson.type)}
                            </div>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                updateLesson(module.id, lesson.id, {
                                  title: e.target.value,
                                })
                              }
                              placeholder={`Lesson ${lessonIndex + 1} Title`}
                              className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
                              style={{
                                backgroundColor: "#e6e5e0",
                                borderColor: "rgba(38, 37, 30, 0.1)",
                                color: "#26251e",
                              }}
                            />
                            <div className="flex items-center gap-2">
                              <Clock
                                className="h-3.5 w-3.5"
                                style={{ color: "rgba(38, 37, 30, 0.4)" }}
                              />
                              <input
                                type="text"
                                value={lesson.duration || ""}
                                onChange={(e) =>
                                  updateLesson(module.id, lesson.id, {
                                    duration: e.target.value,
                                  })
                                }
                                placeholder="10 min"
                                className="w-20 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
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
                              onClick={() => removeLesson(module.id, lesson.id)}
                              className="cursor-btn-hover focus-warm transition-all duration-150"
                              style={{ color: "#cf2d56" }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add lesson buttons */}
                    <div className="flex flex-wrap gap-2 ml-8">
                      <button
                        type="button"
                        onClick={() => addLesson(module.id, "video")}
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
                        onClick={() => addLesson(module.id, "text")}
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
                        onClick={() => addLesson(module.id, "quiz")}
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
                        onClick={() => addLesson(module.id, "code")}
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

        {/* Course Preview */}
        {formData.modules.length > 0 && (
          <Card
            className="cursor-card hover:cursor-card-hover transition-all duration-200"
            style={{ backgroundColor: "#e6e5e0", borderRadius: "8px" }}
          >
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
                    Course Preview
                  </CardTitle>
                  <CardDescription style={{ color: "rgba(38, 37, 30, 0.55)" }}>
                    Summary of your course structure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: "#f7f7f4" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="font-medium"
                      style={{ color: "#26251e" }}
                    >
                      {formData.title || "Untitled Course"}
                    </h3>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs pill-shape"
                            style={{
                              backgroundColor: "#ebeae5",
                              color: "#26251e",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {formData.tags.length > 3 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs pill-shape"
                            style={{
                              backgroundColor: "#ebeae5",
                              color: "#26251e",
                            }}
                          >
                            +{formData.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.description && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: "rgba(38, 37, 30, 0.55)" }}
                    >
                      {formData.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between text-sm"
                    style={{ color: "#26251e" }}
                  >
                    <div className="flex items-center gap-4">
                      <span>{formData.modules.length} modules</span>
                      <span>
                        {formData.modules.reduce(
                          (acc, module) => acc + module.lessons.length,
                          0
                        )}{" "}
                        lessons
                      </span>
                    </div>
                  </div>

                  {formData.modules.map((module, index) => (
                    <div
                      key={module.id}
                      className="p-3 rounded-md border-l-2"
                      style={{
                        backgroundColor: "#f7f7f4",
                        borderLeftColor: "#26251e",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium" style={{ color: "#26251e" }}>
                          {module.title || `Module ${index + 1}`}
                        </h4>
                        <span className="text-xs" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
                          {module.lessons.length} lessons
                        </span>
                      </div>
                      {module.lessons.length > 0 && (
                        <div className="space-y-1">
                          {module.lessons.slice(0, 3).map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 text-xs"
                              style={{ color: "rgba(38, 37, 30, 0.55)" }}
                            >
                              {getLessonIcon(lesson.type)}
                              <span className="line-clamp-1">
                                {lesson.title || "Untitled lesson"}
                              </span>
                            </div>
                          ))}
                          {module.lessons.length > 3 && (
                            <div
                              className="text-xs"
                              style={{ color: "rgba(38, 37, 30, 0.4)" }}
                            >
                              +{module.lessons.length - 3} more lessons
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
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
            disabled={!formData.title || !formData.description}
            className="cursor-btn-hover focus-warm transition-all duration-150"
            style={{
              backgroundColor: formData.title && formData.description
                ? "#ebeae5"
                : "#e6e5e0",
              color: "#26251e",
              opacity: formData.title && formData.description ? 1 : 0.6,
              cursor: formData.title && formData.description
                ? "pointer"
                : "not-allowed",
            }}
          >
            Create Course
          </Button>
        </div>
      </form>
    </div>
  );
}
