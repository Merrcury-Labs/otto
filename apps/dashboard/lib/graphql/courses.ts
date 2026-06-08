export const adminCoursesQuery = /* GraphQL */ `
  query AdminCourses($status: ContentStatus, $search: String) {
    courses(status: $status, search: $search) {
      id
      title
      description
      status
      students
      quizzes
      progress
      duration
      createdAt
      updatedAt
      thumbnail
      prerequisites
      tags
      modules {
        id
        title
        lessons {
          id
          title
          type
          duration
          url
          content
        }
      }
    }
    courseStats {
      total
      published
      students
      averageProgress
    }
  }
`;
