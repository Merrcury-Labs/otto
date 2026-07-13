export const publishedFlashcardDecksQuery = /* GraphQL */ `
  query PublishedFlashcardDecks {
    flashcardDecks(status: "PUBLISHED") {
      id
      title
      description
      status
      courseId
      courseTitle
      cardCount
      avgMastery
      createdAt
      updatedAt
    }
  }
`;

export const flashcardDeckDetailQuery = /* GraphQL */ `
  query FlashcardDeckDetail($id: ID!) {
    flashcardDeck(id: $id) {
      id
      title
      description
      status
      courseId
      courseTitle
      cardCount
      avgMastery
      createdAt
      updatedAt
      cards {
        id
        front
        back
        position
        hint
        tags
      }
    }
  }
`;

export const dueCardsQuery = /* GraphQL */ `
  query DueCards($studentId: ID!, $deckId: ID!) {
    dueCards(studentId: $studentId, deckId: $deckId) {
      id
      front
      back
      position
      hint
      tags
    }
  }
`;

export const reviewFlashcardMutation = /* GraphQL */ `
  mutation ReviewFlashcard($cardId: ID!, $studentId: ID!, $quality: Int!) {
    reviewFlashcard(cardId: $cardId, studentId: $studentId, quality: $quality) {
      id
      easeFactor
      interval
      repetitions
      nextReview
      lastReviewed
      timesCorrect
      timesIncorrect
    }
  }
`;
