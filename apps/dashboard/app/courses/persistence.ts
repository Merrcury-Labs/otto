import type { CourseFormData } from "./types";

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
  title: course.title,
  description: course.description,
  thumbnail: course.thumbnail,
  image: course.thumbnail,
  prerequisites: course.prerequisites.join("\n"),
  category: course.tags[0] ?? "",
  level: course.tags[1] ?? "",
  status,
  lessonCount: getLessonCount(course),
  modules: course.modules.map((module, moduleIndex) => ({
    id: module.id,
    title: module.title || `Module ${moduleIndex + 1}`,
    order: moduleIndex + 1,
    lessons: module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      order: lessonIndex + 1,
    })),
  })),
});

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return response.statusText || "Unable to save course.";
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
    "Unable to save course."
  );
};

export async function saveCourse(
  course: CourseFormData,
  options: SaveCourseOptions = {}
) {
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

  if (contentType?.includes("application/json")) {
    return response.json() as Promise<unknown>;
  }

  return null;
}
