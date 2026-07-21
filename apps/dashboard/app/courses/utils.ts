import type { QuizQuestion } from "./components/LessonModal";
import type { CourseFormData, CourseModule, Lesson } from "./types";

// ---------------------------------------------------------------------------
// Backend types (raw data from GraphQL)
// ---------------------------------------------------------------------------

export type BackendCourse = {
  id: string;
  tutor?: { id: string } | null;
  title: string;
  description: string;
  thumbnail?: string;
  image?: string;
  level: string;
  category: string;
  prerequisites?: string;
  modules?: BackendModule[];
};

export type BackendModule = {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons?: BackendLesson[];
};

export type BackendLesson = {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string | null;
  length?: string;
  sectionName?: string;
  order?: number;
};

export type AdminCoursesData = {
  courses: BackendCourse[];
};

// ---------------------------------------------------------------------------
// Text / image utilities
// ---------------------------------------------------------------------------

export const parseLines = (value?: string) =>
  value
    ?.split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

export const getImageUrl = (value?: string) => {
  const normalizedValue = value?.trim();
  if (
    normalizedValue?.startsWith("/") ||
    normalizedValue?.startsWith("data:image/")
  ) {
    return normalizedValue;
  }

  const imageUrl = value
    ?.match(/https?:\/\/\S+|\/\/\S+|\S+unsplash\.com\S*/i)?.[0]
    .trim()
    .replace(/[),.;]+$/, "");

  if (!imageUrl) return "";
  if (imageUrl.startsWith("//")) return `https:${imageUrl}`;
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("data:")) {
    return imageUrl;
  }
  if (imageUrl.includes("unsplash.com")) return `https://${imageUrl}`;

  return imageUrl;
};

export const getUnsplashPhotoId = (url: URL) => {
  if (url.hostname !== "unsplash.com") return "";

  const [, resource, slug] = url.pathname.split("/");

  if (resource !== "photos" || !slug) return "";

  return slug.split("-").at(-1) ?? "";
};

export const getDisplayableImageUrl = (value: string) => {
  if (!value) return "";
  if (value.startsWith("data:image/") || value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    const imageHosts = ["images.unsplash.com", "plus.unsplash.com"];

    if (
      imageHosts.includes(url.hostname) ||
      /\.(avif|gif|jpe?g|png|webp)$/i.test(url.pathname)
    ) {
      return value;
    }

    const unsplashPhotoId = getUnsplashPhotoId(url);

    if (unsplashPhotoId) {
      return `https://unsplash.com/photos/${unsplashPhotoId}/download?force=true&w=900`;
    }

    if (url.protocol === "https:" || url.protocol === "http:") {
      return value;
    }
  } catch {
    return "";
  }

  return "";
};

export const getCourseImageUrl = (course: BackendCourse) =>
  [course.thumbnail, course.image]
    .map(getImageUrl)
    .map(getDisplayableImageUrl)
    .find(Boolean) ?? "";

type EditorNode = {
  type?: string;
  text?: string;
  content?: EditorNode[];
};

const getEditorNodeText = (node: EditorNode): string => {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";

  const content = node.content?.map(getEditorNodeText).join("") ?? "";
  return node.type === "paragraph" || node.type === "heading"
    ? `${content}\n`
    : content;
};

export const getCourseDescriptionText = (description?: string) => {
  if (!description) return "";

  try {
    const document = JSON.parse(description) as EditorNode;
    if (document.type !== "doc") return description;

    return getEditorNodeText(document).replace(/\n{3,}/g, "\n\n").trim();
  } catch {
    return description;
  }
};

// ---------------------------------------------------------------------------
// Lesson utilities
// ---------------------------------------------------------------------------

export const parseQuizQuestions = (content?: string) => {
  if (!content) return null;

  try {
    const value = JSON.parse(content) as unknown;

    return Array.isArray(value) ? (value as QuizQuestion[]) : null;
  } catch {
    return null;
  }
};

export const getLessonDuration = (length?: string) => {
  if (!length) return "";

  const [hours = "0", minutes = "0", seconds = "0"] = length.split(":");
  const hourCount = Number(hours);
  const minuteCount = Number(minutes);
  const secondCount = Number(seconds);

  if (hourCount) return `${hourCount} hr ${minuteCount} min`;
  if (minuteCount) return `${minuteCount} min`;
  if (secondCount) return `${secondCount} sec`;

  return length;
};

export const normalizeLesson = (lesson: BackendLesson): Lesson => {
  const questions = parseQuizQuestions(lesson.content);

  if (questions) {
    return {
      id: lesson.id,
      title: lesson.title,
      type: "quiz",
      duration: getLessonDuration(lesson.length),
      questions,
    };
  }

  if (lesson.videoUrl) {
    return {
      id: lesson.id,
      title: lesson.title,
      type: "video",
      duration: getLessonDuration(lesson.length),
      url: lesson.videoUrl,
      content: lesson.content,
    };
  }

  return {
    id: lesson.id,
    title: lesson.title,
    type: "text",
    duration: getLessonDuration(lesson.length),
    content: lesson.content,
  };
};

export const normalizeModules = (modules?: BackendModule[]) =>
  modules
    ?.slice()
    .sort((firstModule, secondModule) => {
      const firstOrder = firstModule.order ?? 0;
      const secondOrder = secondModule.order ?? 0;

      return firstOrder - secondOrder || firstModule.title.localeCompare(secondModule.title);
    })
    .map((module) => ({
      id: module.id,
      title: module.title,
      lessons:
        module.lessons
          ?.slice()
          .sort((firstLesson, secondLesson) => {
            const firstOrder = firstLesson.order ?? 0;
            const secondOrder = secondLesson.order ?? 0;

            return (
              firstOrder - secondOrder ||
              firstLesson.title.localeCompare(secondLesson.title)
            );
          })
          .map(normalizeLesson) ?? [],
    })) ?? [];

export const getCourseFormData = (course: BackendCourse): CourseFormData => ({
  tutorId: course.tutor?.id,
  title: course.title,
  description: course.description,
  thumbnail: getCourseImageUrl(course),
  prerequisites: parseLines(course.prerequisites),
  tags: [course.category, course.level].filter(Boolean),
  modules: normalizeModules(course.modules),
});

export const getLessonTypeLabel = (type: Lesson["type"]) => {
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

// ---------------------------------------------------------------------------
// Preview utilities
// ---------------------------------------------------------------------------

/**
 * Convert various YouTube URL formats to embed URLs.
 * Handles:
 *   - youtube.com/watch?v=XXX
 *   - youtu.be/XXX
 *   - youtube.com/embed/XXX (already embed format)
 *   - youtube.com/watch?v=XXX&list=YYY (strips list param)
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    // youtube.com/watch?v=XXX
    if (
      (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtu.be/XXX
    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // youtube.com/embed/XXX — already embed format
    if (
      (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return url;
    }

    // youtube.com/v/XXX
    if (
      (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") &&
      parsed.pathname.startsWith("/v/")
    ) {
      const videoId = parsed.pathname.slice(3);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    // Not a valid URL, try regex fallback
  }

  // Regex fallback for youtube.com/watch?v=XXX
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  // Regex fallback for youtu.be/XXX
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return null;
};

/**
 * Flatten all lessons across modules into a single ordered array.
 * Useful for previous/next navigation.
 */
export const flattenLessons = (modules: CourseModule[]): Lesson[] =>
  modules.flatMap((module) => module.lessons);

/**
 * Find the previous and next lesson relative to a given lesson ID.
 */
export const getAdjacentLessons = (
  modules: CourseModule[],
  lessonId: string | number,
): { previous: Lesson | null; next: Lesson | null } => {
  const flat = flattenLessons(modules);
  const index = flat.findIndex((lesson) => String(lesson.id) === String(lessonId));

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? flat[index - 1] ?? null : null,
    next: index < flat.length - 1 ? flat[index + 1] ?? null : null,
  };
};
