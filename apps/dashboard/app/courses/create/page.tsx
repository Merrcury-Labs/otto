"use client";

import { useState, useMemo } from "react";
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
  Tag,
  TextB,
  TextItalic,
  Code as CodeIcon,
  ListBullets,
  TextH,
  Link,
  DotsSix,
  CheckSquare,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import { Button } from "@repo/ui/button";

interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export type QuizType = "multiple-choice" | "drag-drop" | "checkbox" | "true-false";

interface QuizQuestion {
  id: number;
  question: string;
  type: QuizType;
  options: string[];
  correctAnswer?: number | number[];
  correctItems?: number[];
  answer?: string;
  hint?: string;
}

interface Lesson {
  id: number;
  title: string;
  type: "video" | "text" | "quiz" | "code";
  duration?: string;
  url?: string;
  content?: string;
  questions?: QuizQuestion[];
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

interface LessonFormData {
  title: string;
  type: Lesson["type"];
  duration: string;
  url?: string;
  content?: string;
  questions?: QuizQuestion[];
  quizType?: QuizType;
}

export default function CreateCoursePage() {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    tags: [],
    modules: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: "",
    type: "video",
    duration: "",
  });
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

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

  const openLessonModal = (moduleId: number, type: Lesson["type"]) => {
    setCurrentModuleId(moduleId);
    setLessonFormData({
      title: "",
      type,
      duration: "",
      url: "",
      content: "",
      questions: [],
      quizType: "multiple-choice",
    });
    setIsModalOpen(true);
  };

  const addLesson = (moduleId: number, type: Lesson["type"]) => {
    openLessonModal(moduleId, type);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentModuleId(null);
    setLessonFormData({
      title: "",
      type: "video",
      duration: "",
    });
    setShowMarkdownPreview(false);
  };

  // Simple markdown parser with inline styles
  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return "";

    let html = markdown;

    // Headers with inline styles
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25em; font-weight: 600; margin: 0.83em 0; color: #26251e;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5em; font-weight: 600; margin: 0.75em 0; color: #26251e;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2em; font-weight: 700; margin: 0.67em 0; color: #26251e;">$1</h1>');

    // Bold and italic with inline styles
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong style="font-weight: 600; color: #26251e;">$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em style="font-style: italic; color: #26251e;">$1</em>');

    // Code blocks with inline styles
    html = html.replace(/```([\s\S]*?)```/gim, '<pre style="background-color: #e6e5e0; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin: 1em 0; color: #26251e;"><code style="background-color: transparent; padding: 0;">$1</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code style="background-color: #e6e5e0; padding: 0.125em 0.25em; border-radius: 0.25em; font-size: 0.875em; color: #26251e;">$1</code>');

    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li style="margin: 0.25em 0; color: #26251e;">$1</li>');
    html = html.replace(/^([0-9]+)\. (.*$)/gim, '<li style="margin: 0.25em 0; color: #26251e;">$2</li>');

    // Links with inline styles
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" style="color: #26251e; text-decoration: underline;">$1</a>');

    // Paragraphs
    html = html.replace(/\n\n/gim, '</p><p style="margin: 1em 0; color: #26251e;">');

    // Line breaks for single lines
    html = html.replace(/\n/gim, '<br>');

    return html;
  };

  const markdownPreview = useMemo(() => {
    return parseMarkdown(lessonFormData.content || "");
  }, [lessonFormData.content]);

  const addQuestion = () => {
    const quizType = lessonFormData.quizType || "multiple-choice";
    const newQuestion: QuizQuestion = {
      id: Date.now(),
      question: "",
      type: quizType,
      options: quizType === "true-false" ? ["True", "False"] : ["", "", ""],
      correctAnswer: quizType === "multiple-choice" ? 0 : undefined,
      correctItems: quizType === "drag-drop" ? [] : undefined,
      answer: quizType === "true-false" ? "True" : undefined,
      hint: "",
    };
    setLessonFormData({
      ...lessonFormData,
      questions: [...(lessonFormData.questions || []), newQuestion],
    });
  };

  const removeQuestion = (questionId: number) => {
    setLessonFormData({
      ...lessonFormData,
      questions: lessonFormData.questions?.filter((q) => q.id !== questionId) || [],
    });
  };

  const updateQuestion = (questionId: number, updates: Partial<QuizQuestion>) => {
    setLessonFormData({
      ...lessonFormData,
      questions: lessonFormData.questions?.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ) || [],
    });
  };

  const updateQuizType = (type: QuizType) => {
    setLessonFormData({
      ...lessonFormData,
      quizType: type,
      // Update existing questions to new type
      questions: lessonFormData.questions?.map((q) => ({
        ...q,
        type,
        options: type === "true-false" ? ["True", "False"] : q.options,
        correctAnswer: type === "multiple-choice" ? 0 : undefined,
        correctItems: type === "drag-drop" ? [] : undefined,
        answer: type === "true-false" ? "True" : undefined,
      })) || [],
    });
  };

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector('textarea[name="markdown-editor"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText =
      text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end);

    setLessonFormData({ ...lessonFormData, content: newText });

    // Move cursor to after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + (end - start);
    }, 0);
  };

  const saveLesson = () => {
    if (!currentModuleId) return;

    // Find the current module to calculate lesson index
    const currentModule = formData.modules.find(m => m.id === currentModuleId);
    const lessonIndex = currentModule ? currentModule.lessons.length + 1 : 1;

    const newLesson: Lesson = {
      id: Date.now(),
      title: `${getLessonTypeLabel(lessonFormData.type)} ${lessonIndex}`,
      type: lessonFormData.type,
      duration: "",
    };

    // Add type-specific fields
    if (lessonFormData.type === "video" && lessonFormData.url) {
      newLesson.url = lessonFormData.url;
    }
    if (lessonFormData.type === "text" && lessonFormData.content) {
      newLesson.content = lessonFormData.content;
    }
    if (lessonFormData.type === "quiz" && lessonFormData.questions) {
      newLesson.questions = lessonFormData.questions;
    }
    if (lessonFormData.type === "code" && lessonFormData.content) {
      newLesson.content = lessonFormData.content;
    }

    setFormData({
      ...formData,
      modules: formData.modules.map((module) =>
        module.id === currentModuleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      ),
    });

    closeModal();
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
                            <div className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium pill-shape"
                              style={{ backgroundColor: "#f7f7f4", color: "#26251e" }}>
                              {getLessonIcon(lesson.type)}
                              {getLessonTypeLabel(lesson.type)}
                            </div>
                            <div className="flex-1">
                              <div
                                className="text-sm font-medium"
                                style={{ color: "#26251e" }}
                              >
                                {lesson.title}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "rgba(38, 37, 30, 0.55)" }}
                              >
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

      {/* Lesson Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={closeModal}
        >

          <div
            className="w-full max-w-lg rounded-lg shadow-2xl"
            style={{ backgroundColor: "#e6e5e0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(38, 37, 30, 0.1)" }}>
              <div>
                <h2
                  className="text-xl font-normal"
                  style={{ color: "#26251e", letterSpacing: "-0.11px" }}
                >
                  Add {getLessonTypeLabel(lessonFormData.type)}
                </h2>
                <p className="text-sm mt-1" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
                  {getLessonTypeLabel(lessonFormData.type).toLowerCase()} details
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={closeModal}
                className="cursor-btn-hover focus-warm transition-all duration-150"
                style={{ color: "#26251e" }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type-specific fields */}
              {lessonFormData.type === "video" && (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#26251e" }}
                  >
                    Video URL *
                  </label>
                  <input
                    type="url"
                    value={lessonFormData.url || ""}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, url: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                    style={{
                      backgroundColor: "#f7f7f4",
                      borderColor: "rgba(38, 37, 30, 0.1)",
                      color: "#26251e",
                    }}
                    required
                  />
                  <p
                    className="text-xs mt-2"
                    style={{ color: "rgba(38, 37, 30, 0.55)" }}
                  >
                    Paste YouTube, Vimeo, or any video hosting platform link
                  </p>
                </div>
              )}

              {lessonFormData.type === "text" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: "#26251e" }}
                    >
                      Reading Content (Markdown Supported)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                      className="text-sm px-3 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                      style={{
                        backgroundColor: showMarkdownPreview ? "#e6e5e0" : "#f7f7f4",
                        color: "#26251e",
                      }}
                    >
                      {showMarkdownPreview ? "Edit" : "Preview"}
                    </button>
                  </div>

                  {showMarkdownPreview ? (
                    <div
                      className="w-full px-4 py-3 rounded-md prose prose-sm max-w-none"
                      style={{
                        backgroundColor: "#f7f7f4",
                        borderColor: "rgba(38, 37, 30, 0.1)",
                        color: "#26251e",
                        minHeight: "200px",
                        fontSize: "14px",
                        lineHeight: "1.6",
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: markdownPreview }} />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Markdown Toolbar */}
                      <div
                        className="flex flex-wrap gap-2 p-2 rounded-md"
                        style={{
                          backgroundColor: "#f7f7f4",
                          borderColor: "rgba(38, 37, 30, 0.1)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => insertMarkdown("**", "**")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="Bold"
                        >
                          <TextB className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("*", "*")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="Italic"
                        >
                          <TextItalic className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("# ", "")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="Heading"
                        >
                          <TextH className="h-4 w-4" />
                        </button>
                        <div
                          className="w-px"
                          style={{ backgroundColor: "rgba(38, 37, 30, 0.2)" }}
                        />
                        <button
                          type="button"
                          onClick={() => insertMarkdown("`", "`")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="Inline Code"
                        >
                          <CodeIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("```\n", "\n```")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="Code Block"
                        >
                          <Code className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("- ", "")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="List"
                        >
                          <ListBullets className="h-4 w-4" />
                        </button>
                        <div
                          className="w-px"
                          style={{ backgroundColor: "rgba(38, 37, 30, 0.2)" }}
                        />
                        <button
                          type="button"
                          onClick={() => insertMarkdown("[", "](url)")}
                          className="p-2 rounded cursor-btn-hover focus-warm transition-all duration-150"
                          style={{
                            backgroundColor: "#e6e5e0",
                            color: "#26251e",
                          }}
                          title="Link"
                        >
                          <Link className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Textarea */}
                      <textarea
                        name="markdown-editor"
                        value={lessonFormData.content || ""}
                        onChange={(e) =>
                          setLessonFormData({ ...lessonFormData, content: e.target.value })
                        }
                        placeholder="Write your reading content in markdown...

# Heading
## Subheading

**Bold** and *italic* text

- List item 1
- List item 2

`inline code`

[Link text](https://example.com)"
                        rows={8}
                        className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none font-mono text-sm"
                        style={{
                          backgroundColor: "#f7f7f4",
                          borderColor: "rgba(38, 37, 30, 0.1)",
                          color: "#26251e",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {lessonFormData.type === "quiz" && (
                <div className="space-y-6">
                  {/* Quiz Type Selector */}
                  <div>
                    <label
                      className="text-sm font-medium mb-2"
                      style={{ color: "#26251e" }}
                    >
                      Quiz Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => updateQuizType("multiple-choice")}
                        className={`p-3 rounded-lg border-2 cursor-btn-hover focus-warm transition-all duration-150 text-left ${
                          lessonFormData.quizType === "multiple-choice"
                            ? "bg-[#26251e] text-white border-[#26251e]"
                            : "bg-[#f7f7f4] border-transparent"
                        }`}
                        style={{
                          borderColor:
                            lessonFormData.quizType === "multiple-choice"
                              ? "#26251e"
                                : "rgba(38, 37, 30, 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <DotsSix className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">Multiple Choice</div>
                            <div className="text-xs opacity-75">One correct answer</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuizType("drag-drop")}
                        className={`p-3 rounded-lg border-2 cursor-btn-hover focus-warm transition-all duration-150 text-left ${
                          lessonFormData.quizType === "drag-drop"
                            ? "bg-[#26251e] text-white border-[#26251e]"
                            : "bg-[#f7f7f4] border-transparent"
                        }`}
                        style={{
                          borderColor:
                            lessonFormData.quizType === "drag-drop"
                              ? "#26251e"
                                : "rgba(38, 37, 30, 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <ArrowsLeftRight className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">Drag & Drop</div>
                            <div className="text-xs opacity-75">Match or order items</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuizType("checkbox")}
                        className={`p-3 rounded-lg border-2 cursor-btn-hover focus-warm transition-all duration-150 text-left ${
                          lessonFormData.quizType === "checkbox"
                            ? "bg-[#26251e] text-white border-[#26251e]"
                            : "bg-[#f7f7f4] border-transparent"
                        }`}
                        style={{
                          borderColor:
                            lessonFormData.quizType === "checkbox"
                              ? "#26251e"
                                : "rgba(38, 37, 30, 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">Checks</div>
                            <div className="text-xs opacity-75">Multiple correct answers</div>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuizType("true-false")}
                        className={`p-3 rounded-lg border-2 cursor-btn-hover focus-warm transition-all duration-150 text-left ${
                          lessonFormData.quizType === "true-false"
                            ? "bg-[#26251e] text-white border-[#26251e]"
                            : "bg-[#f7f7f4] border-transparent"
                        }`}
                        style={{
                          borderColor:
                            lessonFormData.quizType === "true-false"
                              ? "#26251e"
                                : "rgba(38, 37, 30, 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          <div>
                            <div className="font-medium text-sm">True/False</div>
                            <div className="text-xs opacity-75">Binary questions</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>


                  {/* Questions Header */}
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-medium"
                      style={{ color: "#26251e" }}
                    >
                      Questions ({lessonFormData.questions?.length || 0})
                    </label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150 text-sm"
                      style={{
                        backgroundColor: "#e6e5e0",
                        color: "#26251e",
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Question
                    </button>
                  </div>

                  {/* Questions List */}
                  {lessonFormData.questions && lessonFormData.questions.length > 0 ? (
                    <div className="space-y-4">
                      {lessonFormData.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="border rounded-lg p-4"
                          style={{
                            backgroundColor: "#f7f7f4",
                            borderColor: "rgba(38, 37, 30, 0.1)",
                          }}
                        >
                          {/* Multiple Choice UI */}
                          {question.type === "multiple-choice" && (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div
                                    className="text-xs font-medium mb-1"
                                    style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                  >
                                    Question {index + 1}
                                  </div>
                                  <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) =>
                                      updateQuestion(question.id, {
                                        question: e.target.value,
                                      })
                                    }
                                    placeholder="Enter your question..."
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
                                  onClick={() => removeQuestion(question.id)}
                                  className="cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{ color: "#cf2d56" }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Options */}
                              <div className="space-y-2 mb-3">
                                <div
                                  className="text-xs font-medium"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Answer Options
                                </div>
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuestion(question.id, {
                                          correctAnswer: optionIndex,
                                        })
                                      }
                                      className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 ${
                                        question.correctAnswer === optionIndex
                                          ? "bg-[#26251e] text-white"
                                          : "bg-[#e6e5e0] text-[#26251e] border"
                                      }`}
                                      style={{
                                        borderColor:
                                          question.correctAnswer === optionIndex
                                            ? "transparent"
                                            : "rgba(38, 37, 30, 0.2)",
                                      }}
                                    >
                                      {question.correctAnswer === optionIndex && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </button>
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[optionIndex] = e.target.value;
                                        updateQuestion(question.id, {
                                          options: newOptions,
                                        });
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                      style={{
                                        backgroundColor: "#e6e5e0",
                                        borderColor: "rgba(38, 37, 30, 0.1)",
                                        color: "#26251e",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Hint */}
                              <div>
                                <div
                                  className="text-xs font-medium mb-1"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Hint (Optional)
                                </div>
                                <input
                                  type="text"
                                  value={question.hint || ""}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      hint: e.target.value,
                                    })
                                  }
                                  placeholder="Add a hint for students..."
                                  className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{
                                    backgroundColor: "#e6e5e0",
                                    borderColor: "rgba(38, 37, 30, 0.1)",
                                    color: "#26251e",
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {/* Drag & Drop UI */}
                          {question.type === "drag-drop" && (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div
                                    className="text-xs font-medium mb-1"
                                    style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                  >
                                    Question {index + 1}
                                  </div>
                                  <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) =>
                                      updateQuestion(question.id, {
                                        question: e.target.value,
                                      })
                                    }
                                    placeholder="Enter your question..."
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
                                  onClick={() => removeQuestion(question.id)}
                                  className="cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{ color: "#cf2d56" }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="mb-3">
                                <div
                                  className="text-xs font-medium mb-2"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Items to Match/Order
                                </div>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div
                                      key={optionIndex}
                                      className={`p-3 rounded-md border-2 cursor-move ${
                                        question.correctItems?.includes(optionIndex)
                                          ? "border-[#26251e]"
                                          : "border-transparent"
                                      }`}
                                      style={{
                                        backgroundColor: "#e6e5e0",
                                        borderColor: question.correctItems?.includes(
                                          optionIndex
                                        )
                                          ? "#26251e"
                                          : "rgba(38, 37, 30, 0.1)",
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <ArrowsLeftRight className="h-4 w-4" />
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...question.options];
                                            newOptions[optionIndex] = e.target.value;
                                            updateQuestion(question.id, {
                                              options: newOptions,
                                            });
                                          }}
                                          placeholder={`Item ${optionIndex + 1}`}
                                          className="flex-1 px-2 py-1 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                          style={{
                                            backgroundColor: "#ebeae5",
                                            borderColor: "rgba(38, 37, 30, 0.1)",
                                            color: "#26251e",
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Hint */}
                              <div>
                                <div
                                  className="text-xs font-medium mb-1"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Hint (Optional)
                                </div>
                                <input
                                  type="text"
                                  value={question.hint || ""}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      hint: e.target.value,
                                    })
                                  }
                                  placeholder="Add a hint for students..."
                                  className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{
                                    backgroundColor: "#e6e5e0",
                                    borderColor: "rgba(38, 37, 30, 0.1)",
                                    color: "#26251e",
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {/* Checkbox UI */}
                          {question.type === "checkbox" && (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div
                                    className="text-xs font-medium mb-1"
                                    style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                  >
                                    Question {index + 1}
                                  </div>
                                  <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) =>
                                      updateQuestion(question.id, {
                                        question: e.target.value,
                                      })
                                    }
                                    placeholder="Enter your question..."
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
                                  onClick={() => removeQuestion(question.id)}
                                  className="cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{ color: "#cf2d56" }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Options with checkboxes */}
                              <div className="space-y-2 mb-3">
                                <div
                                  className="text-xs font-medium"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Answer Options (Select all correct)
                                </div>
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentCorrect = Array.isArray(
                                          question.correctAnswer
                                        )
                                          ? question.correctAnswer
                                          : [];
                                        const newCorrect = currentCorrect.includes(
                                          optionIndex
                                        )
                                          ? currentCorrect.filter(
                                              (i) => i !== optionIndex
                                            )
                                          : [...currentCorrect, optionIndex];
                                        updateQuestion(question.id, {
                                          correctAnswer: newCorrect,
                                        });
                                      }}
                                      className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                                        Array.isArray(question.correctAnswer) &&
                                        question.correctAnswer.includes(optionIndex)
                                          ? "bg-[#26251e] text-white border-[#26251e]"
                                          : "bg-[#e6e5e0] text-[#26251e] border-transparent"
                                      }`}
                                      style={{
                                        borderColor: Array.isArray(
                                          question.correctAnswer
                                        ) &&
                                        question.correctAnswer.includes(optionIndex)
                                          ? "#26251e"
                                          : "rgba(38, 37, 30, 0.2)",
                                      }}
                                    >
                                      {Array.isArray(question.correctAnswer) &&
                                        question.correctAnswer.includes(optionIndex) && (
                                          <Check className="h-3 w-3" />
                                        )}
                                    </button>
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[optionIndex] = e.target.value;
                                        updateQuestion(question.id, {
                                          options: newOptions,
                                        });
                                      }}
                                      placeholder={`Option ${optionIndex + 1}`}
                                      className="flex-1 px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                      style={{
                                        backgroundColor: "#e6e5e0",
                                        borderColor: "rgba(38, 37, 30, 0.1)",
                                        color: "#26251e",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Hint */}
                              <div>
                                <div
                                  className="text-xs font-medium mb-1"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Hint (Optional)
                                </div>
                                <input
                                  type="text"
                                  value={question.hint || ""}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      hint: e.target.value,
                                    })
                                  }
                                  placeholder="Add a hint for students..."
                                  className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{
                                    backgroundColor: "#e6e5e0",
                                    borderColor: "rgba(38, 37, 30, 0.1)",
                                    color: "#26251e",
                                  }}
                                />
                              </div>
                            </>
                          )}

                          {/* True/False UI */}
                          {question.type === "true-false" && (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div
                                    className="text-xs font-medium mb-1"
                                    style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                  >
                                    Question {index + 1}
                                  </div>
                                  <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) =>
                                      updateQuestion(question.id, {
                                        question: e.target.value,
                                      })
                                    }
                                    placeholder="Enter your question..."
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
                                  onClick={() => removeQuestion(question.id)}
                                  className="cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{ color: "#cf2d56" }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* True/False Selection */}
                              <div className="mb-3">
                                <div
                                  className="text-xs font-medium mb-2"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Correct Answer
                                </div>
                                <div className="flex gap-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuestion(question.id, {
                                        answer: "True",
                                      })
                                    }
                                    className={`flex-1 p-4 rounded-lg cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                                      question.answer === "True"
                                        ? "bg-[#26251e] text-white border-[#26251e]"
                                        : "bg-[#e6e5e0] text-[#26251e] border-transparent"
                                    }`}
                                    style={{
                                      borderColor:
                                        question.answer === "True"
                                          ? "#26251e"
                                          : "rgba(38, 37, 30, 0.2)",
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    True
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuestion(question.id, {
                                        answer: "False",
                                      })
                                    }
                                    className={`flex-1 p-4 rounded-lg cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
                                      question.answer === "False"
                                        ? "bg-[#26251e] text-white border-[#26251e]"
                                        : "bg-[#e6e5e0] text-[#26251e] border-transparent"
                                    }`}
                                    style={{
                                      borderColor:
                                        question.answer === "False"
                                          ? "#26251e"
                                          : "rgba(38, 37, 30, 0.2)",
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    False
                                  </button>
                                </div>
                              </div>

                              {/* Hint */}
                              <div>
                                <div
                                  className="text-xs font-medium mb-1"
                                  style={{ color: "rgba(38, 37, 30, 0.55)" }}
                                >
                                  Hint (Optional)
                                </div>
                                <input
                                  type="text"
                                  value={question.hint || ""}
                                  onChange={(e) =>
                                    updateQuestion(question.id, {
                                      hint: e.target.value,
                                    })
                                  }
                                  placeholder="Add a hint for students..."
                                  className="w-full px-3 py-2 rounded-md cursor-btn-hover focus-warm transition-all duration-150"
                                  style={{
                                    backgroundColor: "#e6e5e0",
                                    borderColor: "rgba(38, 37, 30, 0.1)",
                                    color: "#26251e",
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-center py-8 border-2 border-dashed rounded-lg"
                      style={{ borderColor: "rgba(38, 37, 30, 0.2)" }}
                    >
                      <Check
                        className="h-8 w-8 mx-auto mb-2"
                        style={{ color: "rgba(38, 37, 30, 0.4)" }}
                      />
                      <div
                        className="text-sm font-medium mb-1"
                        style={{ color: "#26251e" }}
                      >
                        No questions yet
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "rgba(38, 37, 30, 0.55)" }}
                      >
                        Click "Add Question" to create your first{" "}
                        {lessonFormData.quizType === "multiple-choice" && "multiple choice"}
                        {lessonFormData.quizType === "drag-drop" && "drag and drop"}
                        {lessonFormData.quizType === "checkbox" && "checkbox"}
                        {lessonFormData.quizType === "true-false" && "true/false"}{" "}
                        question
                      </div>
                    </div>
                  )}
                </div>
              )}

              {lessonFormData.type === "code" && (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#26251e" }}
                  >
                    Exercise Instructions or Repository URL
                  </label>
                  <textarea
                    value={lessonFormData.content || ""}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, content: e.target.value })
                    }
                    placeholder="Enter exercise instructions or paste GitHub repository URL..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-md cursor-btn-hover focus-warm transition-all duration-150 resize-none"
                    style={{
                      backgroundColor: "#f7f7f4",
                      borderColor: "rgba(38, 37, 30, 0.1)",
                      color: "#26251e",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t" style={{ borderColor: "rgba(38, 37, 30, 0.1)" }}>
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
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
                type="button"
                onClick={saveLesson}
                className="cursor-btn-hover focus-warm transition-all duration-150"
                style={{
                  backgroundColor: "#ebeae5",
                  color: "#26251e",
                }}
              >
                {getLessonTypeLabel(lessonFormData.type)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
