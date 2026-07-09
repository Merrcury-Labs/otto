export const publishedCoursesQuery = /* GraphQL */ `
  query PublishedCourses {
    courses {
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
    }
  }
`;

export const courseDetailQuery = /* GraphQL */ `
  query CourseDetail {
    courses {
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

export const courseDetailWithEnrollmentQuery = /* GraphQL */ `
  query CourseDetailWithEnrollment($studentId: ID!) {
    courses {
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
      isEnrolled(studentId: $studentId)
      enrollment(studentId: $studentId) {
        id
        progress
        completed
      }
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

export const studentByUserIdQuery = /* GraphQL */ `
  query StudentByUserId($userId: String!) {
    studentByUserId(userId: $userId) {
      id
      name
      email
    }
  }
`;

export const enrollStudentMutation = /* GraphQL */ `
  mutation EnrollStudent($studentId: ID!, $courseId: ID!) {
    enrollStudent(studentId: $studentId, courseId: $courseId) {
      id
      course {
        id
      }
      progress
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
