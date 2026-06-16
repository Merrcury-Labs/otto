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
    }
  }
`;
