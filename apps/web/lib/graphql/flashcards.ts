export const publishedFlashcardDecksQuery = /* GraphQL */ `
  query PublishedFlashcardDecks($viewerUserId: String!) {
    flashcardDecks(status: "PUBLISHED", viewerUserId: $viewerUserId) {
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
      isOwned
    }
  }
`;

export const flashcardDeckDetailQuery = /* GraphQL */ `
  query FlashcardDeckDetail($id: ID!, $viewerUserId: String!) {
    flashcardDeck(id: $id, viewerUserId: $viewerUserId) {
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
      isOwned
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
    $ownerUserId: String!
  ) {
    createFlashcardDeck(
      courseId: $courseId
      title: $title
      description: $description
      status: $status
      ownerUserId: $ownerUserId
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
    $viewerUserId: String!
  ) {
    createFlashcard(
      deckId: $deckId
      front: $front
      back: $back
      position: $position
      hint: $hint
      tags: $tags
      viewerUserId: $viewerUserId
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
    $viewerUserId: String!
  ) {
    updateFlashcardDeck(
      id: $id
      title: $title
      description: $description
      status: $status
      viewerUserId: $viewerUserId
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
    $viewerUserId: String!
  ) {
    updateFlashcard(
      id: $id
      front: $front
      back: $back
      position: $position
      hint: $hint
      tags: $tags
      viewerUserId: $viewerUserId
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
  mutation DeleteFlashcardDeck($id: ID!, $viewerUserId: String!) {
    deleteFlashcardDeck(id: $id, viewerUserId: $viewerUserId)
  }
`;

export const deleteFlashcardMutation = /* GraphQL */ `
  mutation DeleteFlashcard($id: ID!, $viewerUserId: String!) {
    deleteFlashcard(id: $id, viewerUserId: $viewerUserId)
  }
`;
