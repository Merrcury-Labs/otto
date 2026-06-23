// ---------------------------------------------------------------------------
// Backend types (raw data from GraphQL)
// ---------------------------------------------------------------------------

export type BackendCourse = {
  id: string;
  title: string; // aliased from "name"
  description: string;
  tutor: string;
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
  image: string; // resolved from thumbnail/image
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

export const normalizeCourse = (course: BackendCourse): DisplayCourse => ({
  id: course.id,
  title: course.title,
  description: course.description,
  instructor: course.tutor,
  duration: course.lessonCount ? `${course.lessonCount} lessons` : "",
  level: course.level,
  category: course.category,
  status: "PUBLISHED",
  progress: 0,
  rating: 0,
  lessons: course.lessonCount,
  image: getCourseImageUrl(course),
  students: course.students,
  prerequisites: parseLines(course.prerequisites),
  modules: normalizeModules(course.modules),
});
