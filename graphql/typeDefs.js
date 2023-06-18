const {gql} = require('graphql-tag')

const typeDefs = gql`
    type Query {
        getUser(id: ID!): User!
        login(email: String!, password: String!): Auth!
        
    }

    type Auth {
        userId: String!
        token: String!
    }

    type User {
        _id: ID
        name: String!,
        password: String!,
        email: String!
    }

    input UserDataInput {
        name: String!,
        password: String!,
        email: String!
    }

    type Mutation {
        createUser(userData: UserDataInput): User!
    }
`

module.exports = typeDefs