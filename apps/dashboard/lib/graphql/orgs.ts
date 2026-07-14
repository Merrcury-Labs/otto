export const createOrgMutation = /* GraphQL */ `
  mutation CreateOrg(
    $name: String!
    $description: String
    $logo: String
    $website: String
    $ownerUserId: String
  ) {
    createOrg(
      name: $name
      description: $description
      logo: $logo
      website: $website
      ownerUserId: $ownerUserId
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
