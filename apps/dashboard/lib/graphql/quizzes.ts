export const adminQuizzesQuery = /* GraphQL */ `
  query AdminQuizzes($status: ContentStatus, $search: String, $ownerUserId: String) {
    quizzes(status: $status, search: $search, ownerUserId: $ownerUserId) {
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
    quizStats(ownerUserId: $ownerUserId) {
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
    $hint: String
    $categories: JSON
  ) {
    createQuestion(
      quizId: $quizId
      text: $text
      correctOption: $correctOption
      type: $type
      options: $options
      points: $points
      hint: $hint
      categories: $categories
    ) {
      id
    }
  }
`;

export const quizDetailQuery = /* GraphQL */ `
  query QuizDetail($id: ID!) {
    quiz(id: $id) {
      id
      title
      description
      duration
      numQuestions
      passingScore
      status
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
  }
`;

export const updateQuizMutation = /* GraphQL */ `
  mutation UpdateQuiz(
    $id: ID!
    $title: String
    $description: String
    $length: String
    $numQuestions: Int
    $passingScore: Float
    $status: String
  ) {
    updateQuiz(
      id: $id
      title: $title
      description: $description
      length: $length
      numQuestions: $numQuestions
      passingScore: $passingScore
      status: $status
    ) {
      id
    }
  }
`;

export const updateQuestionMutation = /* GraphQL */ `
  mutation UpdateQuestion(
    $id: ID!
    $text: String
    $correctOption: JSON
    $type: String
    $options: JSON
    $points: Int
    $hint: String
    $categories: JSON
  ) {
    updateQuestion(
      id: $id
      text: $text
      correctOption: $correctOption
      type: $type
      options: $options
      points: $points
      hint: $hint
      categories: $categories
    ) {
      id
    }
  }
`;

export const deleteQuestionMutation = /* GraphQL */ `
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id)
  }
`;

export const deleteQuizMutation = /* GraphQL */ `
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;
