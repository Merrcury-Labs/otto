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

export const createFlashcardDeckMutation = /* GraphQL */ `
  mutation CreateFlashcardDeck(
    $courseId: ID!
    $title: String!
    $description: String
    $status: String
  ) {
    createFlashcardDeck(
      courseId: $courseId
      title: $title
      description: $description
      status: $status
    ) {
      id
    }
  }
`;

export const createFlashcardMutation = /* GraphQL */ `
  mutation CreateFlashcard(
    $deckId: ID!
    $front: String!
    $back: String!
    $position: Int
    $hint: String
    $tags: JSON
  ) {
    createFlashcard(
      deckId: $deckId
      front: $front
      back: $back
      position: $position
      hint: $hint
      tags: $tags
    ) {
      id
    }
  }
`;

export const updateFlashcardDeckMutation = /* GraphQL */ `
  mutation UpdateFlashcardDeck(
    $id: ID!
    $title: String
    $description: String
    $status: String
  ) {
    updateFlashcardDeck(
      id: $id
      title: $title
      description: $description
      status: $status
    ) {
      id
      title
      description
      status
    }
  }
`;

export const updateFlashcardMutation = /* GraphQL */ `
  mutation UpdateFlashcard(
    $id: ID!
    $front: String
    $back: String
    $position: Int
    $hint: String
    $tags: JSON
  ) {
    updateFlashcard(
      id: $id
      front: $front
      back: $back
      position: $position
      hint: $hint
      tags: $tags
    ) {
      id
      front
      back
      position
      hint
      tags
    }
  }
`;

export const deleteFlashcardDeckMutation = /* GraphQL */ `
  mutation DeleteFlashcardDeck($id: ID!) {
    deleteFlashcardDeck(id: $id)
  }
`;

export const deleteFlashcardMutation = /* GraphQL */ `
  mutation DeleteFlashcard($id: ID!) {
    deleteFlashcard(id: $id)
  }
`;
