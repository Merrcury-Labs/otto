export const quizzesQuery = /* GraphQL */ `
  query Quizzes($completed: Boolean, $search: String, $category: String) {
    quizzes {
      id
      title
      score
      bestScore
      date
      duration
      category
      difficulty
      questions
      isCompleted
      image
    }
    quizCategories
    userStats {
      totalPoints
      averageScore
      certificates
      streak
    }
  }
`;

export const dashboardQuery = /* GraphQL */ `
  query Dashboard {
    courses(status: PUBLISHED) {
      id
      title
      category
      progress
    }
    quizzes {
      id
      title
      score
      date
    }
    weeklyStats {
      day
      hours
      lessons
    }
    userStats {
      totalPoints
      averageScore
      certificates
      streak
    }
  }
`;

// ── Backend-proxied queries ─────────────────────────────────────────────

/** Fetch published quizzes only (no student context — for anonymous users). */
export const publishedQuizzesQuery = /* GraphQL */ `
  query PublishedQuizzes {
    quizzes(status: PUBLISHED) {
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
    }
  }
`;

/** Fetch published quizzes with student progress data. */
export const publishedQuizzesWithProgressQuery = /* GraphQL */ `
  query PublishedQuizzesWithProgress($studentId: ID!) {
    quizzes(status: PUBLISHED) {
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
    }
    studentQuizProgress(studentId: $studentId) {
      id
      bestScore
      attemptsCount
      completed
      completedDate
      lastAttempted
      quiz {
        id
      }
    }
  }
`;

/** Fetch a single quiz with questions for taking (excludes correctAnswer). */
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
      questions {
        id
        question
        type
        points
        options
        correctAnswer
        hint
        categories
      }
    }
  }
`;

/** Submit a quiz attempt and get scored results. */
export const submitQuizAttemptMutation = /* GraphQL */ `
  mutation SubmitQuizAttempt($studentId: ID!, $quizId: ID!, $answers: JSON!) {
    submitQuizAttempt(studentId: $studentId, quizId: $quizId, answers: $answers) {
      id
      score
      maxPoints
      earnedPoints
      passed
      attemptDate
      answers {
        isCorrect
        points
        response
        question {
          id
          question
          type
          options
          correctAnswer
        }
      }
    }
  }
`;
