export const adminCoursesQuery = /* GraphQL */ `
  query AdminCourses($ownerUserId: String) {
    courses(ownerUserId: $ownerUserId) {
      id
      title: name
      description
      tutor {
        id
        name
      }
      thumbnail
      image
      lessonCount
      level
      category
      prerequisites
      students: enrolledStudents
      modules {
        id
        title
        description
        order
        lessons {
          id
          title
          content
          videoUrl
          length
          sectionName
        }
      }
    }
  }
`;

/** Lightweight query for course dropdowns — only id and title. */
export const courseListQuery = /* GraphQL */ `
  query CourseList($ownerUserId: String) {
    courses(ownerUserId: $ownerUserId) {
      id
      title: name
    }
  }
`;

export const createCourseMutation = /* GraphQL */ `
  mutation CreateCourse(
    $name: String!
    $description: String!
    $tutorId: ID!
    $lessonCount: Int!
    $level: String!
    $category: String!
    $thumbnail: String
    $image: String
    $prerequisites: String
  ) {
    createCourse(
      name: $name
      description: $description
      tutorId: $tutorId
      lessonCount: $lessonCount
      level: $level
      category: $category
      thumbnail: $thumbnail
      image: $image
      prerequisites: $prerequisites
    ) {
      id
    }
  }
`;

export const updateCourseMutation = /* GraphQL */ `
  mutation UpdateCourse(
    $id: ID!
    $name: String
    $description: String
    $tutorId: ID
    $thumbnail: String
    $image: String
    $lessonCount: Int
    $category: String
    $level: String
    $prerequisites: String
  ) {
    updateCourse(
      id: $id
      name: $name
      description: $description
      tutorId: $tutorId
      thumbnail: $thumbnail
      image: $image
      lessonCount: $lessonCount
      category: $category
      level: $level
      prerequisites: $prerequisites
    ) {
      id
      name
      description
      tutor {
        id
        name
      }
      thumbnail
      image
      lessonCount
      level
      category
      prerequisites
    }
  }
`;

export const createModuleMutation = /* GraphQL */ `
  mutation CreateModule(
    $courseId: ID!
    $title: String!
    $description: String!
    $order: Int!
  ) {
    createModule(
      courseId: $courseId
      title: $title
      description: $description
      order: $order
    ) {
      id
      title
    }
  }
`;

export const updateModuleMutation = /* GraphQL */ `
  mutation UpdateModule(
    $id: ID!
    $title: String
    $description: String
    $order: Int
  ) {
    updateModule(
      id: $id
      title: $title
      description: $description
      order: $order
    ) {
      id
      title
    }
  }
`;

export const createLessonMutation = /* GraphQL */ `
  mutation CreateLesson(
    $title: String!
    $content: String!
    $length: String!
    $sectionName: String
    $courseId: ID
    $moduleId: ID
    $videoUrl: String
  ) {
    createLesson(
      title: $title
      content: $content
      length: $length
      sectionName: $sectionName
      courseId: $courseId
      moduleId: $moduleId
      videoUrl: $videoUrl
    ) {
      id
      title
    }
  }
`;

export const updateLessonMutation = /* GraphQL */ `
  mutation UpdateLesson(
    $id: ID!
    $title: String
    $content: String
    $length: String
    $sectionName: String
    $courseId: ID
    $moduleId: ID
    $videoUrl: String
  ) {
    updateLesson(
      id: $id
      title: $title
      content: $content
      length: $length
      sectionName: $sectionName
      courseId: $courseId
      moduleId: $moduleId
      videoUrl: $videoUrl
    ) {
      id
      title
    }
  }
`;

export const deleteLessonMutation = /* GraphQL */ `
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`;

export const lessonsQuery = /* GraphQL */ `
  query Lessons {
    lessons {
      id
      title
      content
      sectionName
      videoUrl
      length
      course {
        id
        name
      }
      module {
        id
        title
      }
    }
  }
`;

export const lessonQuery = /* GraphQL */ `
  query Lesson($id: ID!) {
    lesson(id: $id) {
      id
      title
      content
      sectionName
      videoUrl
      length
      course {
        id
        name
      }
      module {
        id
        title
      }
    }
  }
`;
