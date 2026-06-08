export const adminQuizzesQuery = /* GraphQL */ `
  query AdminQuizzes($status: ContentStatus, $search: String) {
    quizzes(status: $status, search: $search) {
      id
      title
      description
      status
      duration
      courseId
      courseTitle
      attempts
      avgScore
      createdAt
      updatedAt
      questions {
        id
        question
        type
        points
        options
        correctAnswer
        categories
        hint
      }
    }
    quizStats {
      total
      published
      attempts
      averageScore
    }
  }
`;
