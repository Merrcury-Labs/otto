export const publishedCoursesQuery = /* GraphQL */ `
  query PublishedCourses {
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
    }
  }
`;

export const courseDetailQuery = /* GraphQL */ `
  query CourseDetail {
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
