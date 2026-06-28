export const typeDefs = `
  type Step {
    index: Int!
    label: String!
    completed: Boolean!
  }

  enum ReleaseStatus {
    planned
    ongoing
    done
  }

  type Release {
    id: ID!
    name: String!
    due_date: String!
    additional_info: String
    steps: [Step!]!
    status: ReleaseStatus!
    created_at: String!
    updated_at: String!
  }

  type StepToggleResult {
    steps: [Step!]!
    status: ReleaseStatus!
  }

  type Query {
    releases: [Release!]!
    release(id: ID!): Release
  }

  type Mutation {
    createRelease(name: String!, due_date: String!, additional_info: String): Release!
    updateRelease(id: ID!, name: String, additional_info: String): Release!
    toggleStep(id: ID!, stepIndex: Int!, completed: Boolean!): StepToggleResult!
    deleteRelease(id: ID!): Boolean!
  }
`
