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

/** Fetch all quizzes (no student context — for anonymous users). */
export const publishedQuizzesQuery = /* GraphQL */ `
  query PublishedQuizzes {
    quizzes {
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

/** Fetch all quizzes with student progress data. */
export const publishedQuizzesWithProgressQuery = /* GraphQL */ `
  query PublishedQuizzesWithProgress($studentId: ID!) {
    quizzes {
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
