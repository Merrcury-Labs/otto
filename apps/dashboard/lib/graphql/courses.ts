export const adminCoursesQuery = /* GraphQL */ `
  query AdminCourses {
    courses {
      id
      title: name
      description
      tutor
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

export const createCourseMutation = /* GraphQL */ `
  mutation CreateCourse(
    $name: String!
    $description: String!
    $tutor: String!
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
      tutor: $tutor
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
    $tutor: String
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
      tutor: $tutor
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
      tutor
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
