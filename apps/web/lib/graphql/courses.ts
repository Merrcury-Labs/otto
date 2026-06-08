export const publishedCoursesQuery = /* GraphQL */ `
  query PublishedCourses($search: String, $category: String, $level: String) {
    courses(
      status: PUBLISHED
      search: $search
      category: $category
      level: $level
    ) {
      id
      title
      description
      instructor
      duration
      level
      category
      status
      progress
      rating
      lessons
      image
    }
  }
`;

export const adminCoursesQuery = /* GraphQL */ `
  query AdminCourses($status: CourseStatus) {
    courses(status: $status) {
      id
      title
      description
      status
    }
  }
`;

export const courseQuery = /* GraphQL */ `
  query Course($id: ID!) {
    course(id: $id) {
      id
      title
      description
      instructor
      duration
      level
      category
      status
      progress
      rating
      lessons
      image
    }
  }
`;
