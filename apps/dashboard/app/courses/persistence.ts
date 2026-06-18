import type { CourseFormData, Lesson } from "./types";

type SaveCourseOptions = {
  id?: string;
  status?: string;
};

const getLessonCount = (course: CourseFormData) =>
  course.modules.reduce((total, module) => total + module.lessons.length, 0);

const getCoursePayload = (
  course: CourseFormData,
  { status = "draft" }: SaveCourseOptions = {}
) => ({
  name: course.title,
  description: course.description,
  thumbnail: course.thumbnail,
  image: course.thumbnail,
  prerequisites: course.prerequisites.join("\n"),
  category: course.tags[0] ?? "",
  level: course.tags[1] ?? "",
  status,
});

const getDurationValue = (duration: string) => {
  const value = duration.trim().toLowerCase();
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)/);
  const minutes = value.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)/);
  const seconds = value.match(/(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds)/);

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    return value.split(":").length === 2 ? `00:${value}` : value;
  }

  const totalSeconds =
    Math.round(Number(hours?.[1] ?? 0) * 3600) +
    Math.round(Number(minutes?.[1] ?? 0) * 60) +
    Math.round(Number(seconds?.[1] ?? 0));

  if (!totalSeconds) return "00:00:00";

  const formattedHours = Math.floor(totalSeconds / 3600);
  const formattedMinutes = Math.floor((totalSeconds % 3600) / 60);
  const formattedSeconds = totalSeconds % 60;

  return [formattedHours, formattedMinutes, formattedSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

const getLessonContent = (lesson: Lesson) => {
  if (lesson.content) return lesson.content;
  if (lesson.type === "quiz" && lesson.questions) {
    return JSON.stringify(lesson.questions);
  }
  if (lesson.url) return lesson.url;

  return lesson.title;
};

const getLessonPayload = (
  courseId: string,
  lesson: Lesson,
  sectionName: string
) => ({
  course: courseId,
  title: lesson.title,
  content: getLessonContent(lesson),
  video_url: lesson.type === "video" ? lesson.url || null : null,
  length: getDurationValue(lesson.duration || ""),
  section_name: sectionName,
});

const getErrorMessage = async (
  response: Response,
  fallback = "Unable to save course."
) => {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return response.statusText || fallback;
  }

  const result = (await response.json()) as {
    message?: string;
    error?: string;
    errors?: Array<{ message?: string }>;
  };

  return (
    result.errors?.[0]?.message ||
    result.message ||
    result.error ||
    fallback
  );
};

const extractCourseId = (result: unknown): string | null => {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const id = record.id ?? record.uuid ?? record.pk;

  if (typeof id === "string" || typeof id === "number") return String(id);

  return extractCourseId(record.course) ?? extractCourseId(record.data);
};

const saveLessons = async (course: CourseFormData, courseId: string) => {
  const lessonRequests = course.modules.flatMap((module, moduleIndex) => {
    const sectionName = module.title || `Module ${moduleIndex + 1}`;

    return module.lessons.map((lesson) =>
      fetch("/api/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getLessonPayload(courseId, lesson, sectionName)),
      })
    );
  });

  const responses = await Promise.all(lessonRequests);
  const failedResponse = responses.find((response) => !response.ok);

  if (failedResponse) {
    throw new Error(
      await getErrorMessage(failedResponse, "Unable to save lesson.")
    );
  }
};

export async function saveCourse(course: CourseFormData, options: SaveCourseOptions = {}) {
  const response = await fetch(
    options.id ? `/api/courses/${options.id}` : "/api/courses",
    {
      method: options.id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getCoursePayload(course, options)),
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const contentType = response.headers.get("content-type");
  const result = contentType?.includes("application/json")
    ? await response.json()
    : null;
  const courseId = options.id ?? extractCourseId(result);

  if (getLessonCount(course) > 0) {
    if (!courseId) {
      throw new Error("Course saved, but the response did not include a course id for lessons.");
    }

    await saveLessons(course, courseId);
  }

  return result;
}
