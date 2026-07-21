export const createOrgMutation = /* GraphQL */ `
  mutation CreateOrg(
    $name: String!
    $description: String
    $logo: String
    $website: String
    $ownerUserId: String
    $ownerName: String
    $ownerEmail: String
  ) {
    createOrg(
      name: $name
      description: $description
      logo: $logo
      website: $website
      ownerUserId: $ownerUserId
      ownerName: $ownerName
      ownerEmail: $ownerEmail
    ) {
      id
      name
      description
      logo
      website
      ownerUserId
    }
  }
`;

export const tutorsQuery = /* GraphQL */ `
  query Tutors($ownerUserId: String) {
    tutors(ownerUserId: $ownerUserId) {
      id
      name
      email
      bio
      profilePicture
    }
  }
`;

export const createTutorForOwnerMutation = /* GraphQL */ `
  mutation CreateTutorForOwner(
    $ownerUserId: String!
    $name: String!
    $email: String!
    $bio: String
    $profilePicture: String
  ) {
    createTutorForOwner(
      ownerUserId: $ownerUserId
      name: $name
      email: $email
      bio: $bio
      profilePicture: $profilePicture
    ) {
      id
      name
      email
      bio
      profilePicture
    }
  }
`;

export const orgByOwnerQuery = /* GraphQL */ `
  query OrgByOwner($ownerUserId: String!) {
    orgByOwner(ownerUserId: $ownerUserId) {
      id
      name
      description
      logo
      website
      ownerUserId
    }
  }
`;
