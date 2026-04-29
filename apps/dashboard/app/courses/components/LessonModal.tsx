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
  X,
  Plus,
  Trash,
  FileText,
  Video,
  Code,
  Check,
  BookOpen,
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

interface LessonFormData {
  title: string;
  type: "video" | "text" | "quiz" | "code";
  duration: string;
  url?: string;
  content?: string;
  questions?: QuizQuestion[];
  quizType?: QuizType;
}

interface LessonModalProps {
  isOpen: boolean;
  lessonType: "video" | "text" | "quiz" | "code";
  onSave: (data: any) => void;
  onClose: () => void;
}

export default function LessonModal({
  isOpen,
  lessonType,
  onSave,
  onClose,
}: LessonModalProps) {
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: "",
    type: lessonType,
    duration: "",
    url: "",
    content: "",
    questions: [],
    quizType: lessonType === "quiz" ? "multiple-choice" : undefined,
  });

  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

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

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + before.length + (end - start);
    }, 0);
  };

  const getLessonTypeLabel = (type: string) => {
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

  const parseMarkdown = (markdown: string): string => {
    if (!markdown) return "";

    let html = markdown;

    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25em; font-weight: 600; margin: 0.83em 0; color: #26251e;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5em; font-weight: 600; margin: 0.75em 0; color: #26251e;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2em; font-weight: 700; margin: 0.67em 0; color: #26251e;">$1</h1>');

    html = html.replace(/\*\*(.*)\*\*/gim, '<strong style="font-weight: 600; color: #26251e;">$1</strong>');
    html = html.replace(/\*(.*)\*/gim, '<em style="font-style: italic; color: #26251e;">$1</em>');

    html = html.replace(/```([\s\S]*?)```/gim, '<pre style="background-color: #e6e5e0; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin: 1em 0; color: #26251e;"><code style="background-color: transparent; padding: 0;">$1</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code style="background-color: #e6e5e0; padding: 0.125em 0.25em; border-radius: 0.25em; font-size: 0.875em; color: #26251e;">$1</code>');

    html = html.replace(/^\- (.*$)/gim, '<li style="margin: 0.25em 0; color: #26251e;">$1</li>');
    html = html.replace(/^([0-9]+)\. (.*$)/gim, '<li style="margin: 0.25em 0; color: #26251e;">$2</li>');

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" style="color: #26251e; text-decoration: underline;">$1</a>');

    html = html.replace(/\n\n/gim, '</p><p style="margin: 1em 0; color: #26251e;">');
    html = html.replace(/\n/gim, '<br>');

    return html;
  };

  const markdownPreview = parseMarkdown(lessonFormData.content || "");

  const handleSave = () => {
    onSave(lessonFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
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
              Add {getLessonTypeLabel(lessonType)}
            </h2>
            <p className="text-sm mt-1" style={{ color: "rgba(38, 37, 30, 0.55)" }}>
              {getLessonTypeLabel(lessonType).toLowerCase()} details
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="cursor-btn-hover focus-warm transition-all duration-150"
            style={{ color: "#26251e" }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {lessonType === "video" && (
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

          {lessonType === "text" && (
            <div className="space-y-3">
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
                  className="w-full px-4 py-3 rounded-md"
                  style={{
                    backgroundColor: "#f7f7f4",
                    borderColor: "rgba(38, 37, 30, 0.1)",
                    color: "#26251e",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: markdownPreview }} />
                </div>
              ) : (
                <>
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
                    <div
                      className="w-px"
                      style={{ backgroundColor: "rgba(38, 37, 30, 0.2)" }}
                    />
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
                      onClick={() => insertMarkdown("```", "\n```")}
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
                </>
              )}
            </div>
          )}

          {lessonType === "code" && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#26251e" }}
              >
                Exercise Instructions
              </label>
              <textarea
                value={lessonFormData.content || ""}
                onChange={(e) =>
                  setLessonFormData({ ...lessonFormData, content: e.target.value })
                }
                placeholder="Enter exercise instructions or paste GitHub repository URL..."
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

          {lessonType === "quiz" && (
            <div className="space-y-6">
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
                                  className={`w-6 h-6 rounded-md flex items-center justify-center cursor-btn-hover focus-warm transition-all duration-150 border-2 ${
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
                              <Trash className="h-4 w-4" }
                            />
                          </div>

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
                                          : "bg-[#e6e5e0] text-[#26251e] border"
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
                                        : "bg-[#e6e5e0] text-[#26251e] border"
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
                                        : "bg-[#e6e5e0] text-[#26251e] border"
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

          {lessonType === "quiz" && (
            <div className="space-y-6">
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
            </div>
          )}

          <div className="flex justify-end gap-3 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
              onClick={handleSave}
              className="cursor-btn-hover focus-warm transition-all duration-150"
              style={{
                backgroundColor: "#ebeae5",
                color: "#26251e",
              }}
            >
              {getLessonTypeLabel(lessonType)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}