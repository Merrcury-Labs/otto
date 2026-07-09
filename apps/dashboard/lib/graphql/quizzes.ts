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

export const createQuizMutation = /* GraphQL */ `
  mutation CreateQuiz(
    $courseId: ID!
    $title: String!
    $length: String!
    $numQuestions: Int!
    $author: String!
    $description: String
    $passingScore: Float
  ) {
    createQuiz(
      courseId: $courseId
      title: $title
      length: $length
      numQuestions: $numQuestions
      author: $author
      description: $description
      passingScore: $passingScore
    ) {
      id
    }
  }
`;

export const createQuestionMutation = /* GraphQL */ `
  mutation CreateQuestion(
    $quizId: ID!
    $text: String!
    $correctOption: JSON!
    $type: String!
    $options: JSON
    $points: Int
  ) {
    createQuestion(
      quizId: $quizId
      text: $text
      correctOption: $correctOption
      type: $type
      options: $options
      points: $points
    ) {
      id
    }
  }
`;
