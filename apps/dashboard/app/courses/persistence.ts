import type { CourseFormData, CourseModule, Lesson } from "./types";
import { graphqlFetch } from "../../lib/graphql/client";
import {
  createCourseMutation,
  createLessonMutation,
  createModuleMutation,
  deleteLessonMutation,
  updateLessonMutation,
  updateModuleMutation,
  updateCourseMutation,
} from "../../lib/graphql/courses";
import { tutorsQuery } from "../../lib/graphql/orgs";

type SaveCourseOptions = {
  id?: string;
  status?: string;
  deletedLessonIds?: string[];
};

const getLessonCount = (course: CourseFormData) =>
  course.modules.reduce((total, module) => total + module.lessons.length, 0);

const getCoursePayload = (course: CourseFormData, tutorId: string) => ({
  name: course.title,
  description: course.description,
  tutorId,
  lessonCount: getLessonCount(course),
  level: course.tags[1] ?? "",
  category: course.tags[0] ?? "",
  thumbnail: course.thumbnail,
  image: course.thumbnail,
  prerequisites: course.prerequisites.join("\n"),
});

const getUpdateCoursePayload = (course: CourseFormData, tutorId: string) => ({
  name: course.title,
  description: course.description,
  tutorId,
  thumbnail: course.thumbnail,
  image: course.thumbnail,
  lessonCount: getLessonCount(course),
  category: course.tags[0] ?? "",
  level: course.tags[1] ?? "",
  prerequisites: course.prerequisites.join("\n"),
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
  sectionName: string,
  moduleId: string | null
) => ({
  title: lesson.title,
  content: getLessonContent(lesson),
  length: getDurationValue(lesson.duration || ""),
  sectionName,
  courseId,
  moduleId,
  videoUrl: lesson.type === "video" ? lesson.url || null : null,
});

const getModulePayload = (
  courseId: string,
  module: CourseModule,
  moduleIndex: number
) => ({
  courseId,
  title: module.title || `Module ${moduleIndex + 1}`,
  description: "",
  order: moduleIndex,
});

const getPersistedRecordId = (id: CourseModule["id"] | Lesson["id"]) =>
  typeof id === "string" && id.trim().length > 0 ? id : null;

const extractRecordId = (result: unknown): string | null => {
  if (!result || typeof result !== "object") return null;

  const record = result as Record<string, unknown>;
  const id = record.id ?? record.uuid ?? record.pk;

  if (typeof id === "string" || typeof id === "number") return String(id);

  for (const value of Object.values(record)) {
    const nestedId = extractRecordId(value);

    if (nestedId) return nestedId;
  }

  return null;
};

const saveModules = async (course: CourseFormData, courseId: string) => {
  return Promise.all(
    course.modules.map(async (module, moduleIndex) => {
      const payload = getModulePayload(courseId, module, moduleIndex);
      const existingModuleId = getPersistedRecordId(module.id);

      if (existingModuleId) {
        await graphqlFetch<unknown>({
          query: updateModuleMutation,
          variables: {
            id: existingModuleId,
            title: payload.title,
            description: payload.description,
            order: payload.order,
          },
        });

        return {
          id: existingModuleId,
          title: payload.title,
        };
      }

      const result = await graphqlFetch<unknown>({
        query: createModuleMutation,
        variables: payload,
      });

      return {
        id: extractRecordId(result),
        title: payload.title,
      };
    })
  );
};

const saveLessons = async (
  course: CourseFormData,
  courseId: string,
  savedModules: Array<{ id: string | null; title: string }>
) => {
  await Promise.all(
    course.modules.flatMap((module, moduleIndex) => {
      const sectionName =
        savedModules[moduleIndex]?.title ||
        module.title ||
        `Module ${moduleIndex + 1}`;
      const moduleId = savedModules[moduleIndex]?.id ?? null;

      if (module.lessons.length > 0 && !moduleId) {
        throw new Error(
          `Module "${sectionName}" saved, but the response did not include a module id for its lessons.`
        );
      }

      return module.lessons.map((lesson) => {
        const payload = getLessonPayload(
          courseId,
          lesson,
          sectionName,
          moduleId
        );
        const existingLessonId = getPersistedRecordId(lesson.id);

        if (existingLessonId) {
          return graphqlFetch<unknown>({
            query: updateLessonMutation,
            variables: {
              id: existingLessonId,
              ...payload,
            },
          });
        }

        return graphqlFetch<unknown>({
          query: createLessonMutation,
          variables: payload,
        });
      });
    })
  );
};

const saveCourseRecord = async (
  course: CourseFormData,
  options: SaveCourseOptions
) => {
  const { tutors } = await graphqlFetch<{
    tutors: Array<{ id: string }>;
  }>({
    query: tutorsQuery,
    operationName: "Tutors",
  });
  const tutorId = course.tutorId ?? tutors[0]?.id;

  if (!tutorId) {
    throw new Error(
      "Your organization does not have a tutor. Add a tutor before saving a course.",
    );
  }

  const payload = getCoursePayload(course, tutorId);

  if (options.id) {
    return graphqlFetch<unknown>({
      query: updateCourseMutation,
      variables: {
        id: options.id,
        ...getUpdateCoursePayload(course, tutorId),
      },
    });
  }

  return graphqlFetch<unknown>({
    query: createCourseMutation,
    variables: payload,
  });
};

export async function saveCourse(
  course: CourseFormData,
  options: SaveCourseOptions = {}
) {
  const result = await saveCourseRecord(course, options);
  const courseId = options.id ?? extractRecordId(result);

  if (course.modules.length > 0) {
    if (!courseId) {
      throw new Error(
        "Course saved, but the response did not include a course id for modules."
      );
    }

    const savedModules = await saveModules(course, courseId);

    if (getLessonCount(course) > 0) {
      await saveLessons(course, courseId, savedModules);
    }
  }

  if (options.deletedLessonIds?.length) {
    await Promise.all(
      [...new Set(options.deletedLessonIds)].map((id) =>
        graphqlFetch<{ deleteLesson: boolean }>({
          query: deleteLessonMutation,
          variables: { id },
          operationName: "DeleteLesson",
        }),
      ),
    );
  }

  return result;
}
