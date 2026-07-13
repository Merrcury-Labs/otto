export const adminFlashcardDecksQuery = /* GraphQL */ `
  query AdminFlashcardDecks($status: String, $search: String, $ownerUserId: String) {
    flashcardDecks(status: $status, search: $search, ownerUserId: $ownerUserId) {
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
    flashcardDeckStats(ownerUserId: $ownerUserId) {
      total
      published
      totalReviews
      averageMastery
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
    }
  }
`;

export const deleteFlashcardDeckMutation = /* GraphQL */ `
  mutation DeleteFlashcardDeck($id: ID!) {
    deleteFlashcardDeck(id: $id)
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
    }
  }
`;

export const deleteFlashcardMutation = /* GraphQL */ `
  mutation DeleteFlashcard($id: ID!) {
    deleteFlashcard(id: $id)
  }
`;
