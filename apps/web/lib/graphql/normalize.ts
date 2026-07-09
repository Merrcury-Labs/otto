// ---------------------------------------------------------------------------
// Backend types (raw data from GraphQL)
// ---------------------------------------------------------------------------

export type BackendTutor = {
  id: string;
  name: string;
};

export type BackendCourse = {
  id: string;
  title: string; // aliased from "name"
  description: string;
  tutor: BackendTutor | null;
  thumbnail?: string;
  image?: string;
  lessonCount: number;
  level: string;
  category: string;
  prerequisites?: string;
  students: number; // aliased from "enrolledStudents"
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

// ---------------------------------------------------------------------------
// Frontend display types
// ---------------------------------------------------------------------------

export type DisplayLesson = {
  id: string | number;
  title: string;
  type: "video" | "text" | "quiz";
  duration: string;
  url?: string;
  content?: string;
};

export type DisplayModule = {
  id: string | number;
  title: string;
  lessons: DisplayLesson[];
};

export type DisplayCourse = {
  id: string | number;
  title: string;
  description: string;
  instructor: string; // normalized from tutor
  duration: string; // computed from lessonCount
  level: string;
  category: string;
  status: string; // always "PUBLISHED"
  progress: number; // 0 by default
  rating: number; // 0 by default
  lessons: number; // from lessonCount
  thumbnail: string; // resolved thumbnail URL
  image: string; // resolved image URL (falls back to thumbnail)
  students: number; // from enrolledStudents alias
  prerequisites: string[]; // parsed from prerequisites string
  modules: DisplayModule[];
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

const getUnsplashPhotoId = (url: URL) => {
  if (url.hostname !== "unsplash.com") return "";

  const [, resource, slug] = url.pathname.split("/");

  if (resource !== "photos" || !slug) return "";

  return slug.split("-").at(-1) ?? "";
};

const getDisplayableImageUrl = (value: string) => {
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

    // Unsplash download URLs — return as-is, <img> tags follow redirects natively
    if (
      (url.hostname === "unsplash.com" || url.hostname === "www.unsplash.com")
    ) {
      return value;
    }

    // Unsplash page URLs like unsplash.com/photos/a-sunset-abc123 — convert to direct image
    const unsplashPhotoId = getUnsplashPhotoId(url);

    if (unsplashPhotoId) {
      return `https://images.unsplash.com/photo-${unsplashPhotoId}?w=800&auto=format&fit=crop&q=60`;
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

// ---------------------------------------------------------------------------
// Lesson utilities
// ---------------------------------------------------------------------------

const parseQuizQuestions = (content?: string) => {
  if (!content) return null;

  try {
    const value = JSON.parse(content) as unknown;

    return Array.isArray(value) ? value : null;
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

export const normalizeLesson = (lesson: BackendLesson): DisplayLesson => {
  const questions = parseQuizQuestions(lesson.content);

  if (questions) {
    return {
      id: lesson.id,
      title: lesson.title,
      type: "quiz",
      duration: getLessonDuration(lesson.length),
      content: lesson.content,
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
          .map(normalizeLesson) ?? [],
    })) ?? [];

// ---------------------------------------------------------------------------
// Lesson type utilities
// ---------------------------------------------------------------------------

export const getLessonTypeLabel = (type: DisplayLesson["type"]) => {
  switch (type) {
    case "video":
      return "Video";
    case "text":
      return "Reading";
    case "quiz":
      return "Quiz";
    default:
      return "Lesson";
  }
};

/**
 * Flatten all lessons across modules into a single ordered array.
 */
export const flattenLessons = (modules: DisplayModule[]): DisplayLesson[] =>
  modules.flatMap((module) => module.lessons);

/**
 * Find the previous and next lesson relative to a given lesson ID.
 */
export const getAdjacentLessons = (
  modules: DisplayModule[],
  lessonId: string | number,
): { previous: DisplayLesson | null; next: DisplayLesson | null } => {
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

/**
 * Convert various YouTube URL formats to embed URLs.
 */
export const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    if (
      (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (
      (parsed.hostname === "www.youtube.com" || parsed.hostname === "youtube.com") &&
      parsed.pathname.startsWith("/embed/")
    ) {
      return url;
    }

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

  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  return null;
};

export const normalizeCourse = (course: BackendCourse): DisplayCourse => {
  const thumbnailUrl = [course.thumbnail].map(getImageUrl).map(getDisplayableImageUrl).find(Boolean) ?? "";
  const imageUrl = [course.image].map(getImageUrl).map(getDisplayableImageUrl).find(Boolean) || thumbnailUrl;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.tutor?.name ?? "",
    duration: course.lessonCount ? `${course.lessonCount} lessons` : "",
    level: course.level,
    category: course.category,
    status: "PUBLISHED",
    progress: 0,
    rating: 0,
    lessons: course.lessonCount,
    thumbnail: thumbnailUrl,
    image: imageUrl,
    students: course.students,
    prerequisites: parseLines(course.prerequisites),
    modules: normalizeModules(course.modules),
  };
};

// ---------------------------------------------------------------------------
// Quiz normalization (backend → display)
// ---------------------------------------------------------------------------

export type BackendQuiz = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  numQuestions?: number;
  passingScore?: number;
  status?: string;
  courseId?: string;
  courseTitle?: string;
  attempts?: number;
  avgScore?: number;
};

export type BackendQuizProgress = {
  id: string;
  bestScore: number;
  attemptsCount: number;
  completed: boolean;
  completedDate?: string | null;
  lastAttempted?: string | null;
  quiz: { id: string };
};

export type DisplayQuiz = {
  id: string | number;
  title: string;
  description: string;
  score: number;
  bestScore: number;
  date: string;
  duration: string;
  category: string;
  difficulty: string;
  questions: number;
  isCompleted: boolean;
  image: string;
  attempts: number;
  avgScore: number;
  passingScore: number;
  courseId: string;
  courseTitle: string;
  status: string;
};

const deriveDifficulty = (passingScore?: number): string => {
  if (!passingScore) return "Intermediate";
  if (passingScore >= 80) return "Advanced";
  if (passingScore >= 50) return "Intermediate";
  return "Beginner";
};

const formatDate = (value?: string | null): string => {
  if (!value) return "-";
  try {
    const iso = new Date(value as string).toISOString();
    const datePart = iso.split("T")[0];
    return datePart ?? "-";
  } catch {
    return "-";
  }
};

const formatDuration = (value?: string): string => {
  if (!value) return "";
  // Backend returns timedelta strings like "0:15:00" or "0:25:00"
  const match = value.match(/^(?:(\d+):)?(\d+):(\d+)$/);
  if (match) {
    const hours = parseInt(match[1] ?? "0", 10);
    const minutes = parseInt(match[2] ?? "0", 10);
    if (hours) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  return value;
};

export const normalizeQuiz = (
  quiz: BackendQuiz,
  progress?: BackendQuizProgress | null,
): DisplayQuiz => ({
  id: quiz.id,
  title: quiz.title,
  description: quiz.description ?? "",
  score: progress?.bestScore ?? 0,
  bestScore: progress?.bestScore ?? 0,
  date: formatDate(progress?.lastAttempted),
  duration: formatDuration(quiz.duration),
  category: quiz.courseTitle ?? "",
  difficulty: deriveDifficulty(quiz.passingScore),
  questions: quiz.numQuestions ?? 0,
  isCompleted: progress?.completed ?? false,
  image: "",
  attempts: quiz.attempts ?? 0,
  avgScore: quiz.avgScore ?? 0,
  passingScore: quiz.passingScore ?? 0,
  courseId: quiz.courseId ?? "",
  courseTitle: quiz.courseTitle ?? "",
  status: quiz.status ?? "DRAFT",
});
