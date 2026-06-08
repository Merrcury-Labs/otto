export const quizzesQuery = /* GraphQL */ `
  query Quizzes($completed: Boolean, $search: String, $category: String) {
    quizzes(completed: $completed, search: $search, category: $category) {
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
