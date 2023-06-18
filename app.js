const dotenv = require('dotenv').config()
const express = require('express')
const {ApolloServer} = require('@apollo/server')
const {expressMiddleware} = require('@apollo/server/express4')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const auth = require('./middleware/is-auth')

// server config
const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        if(!error.originalError) {
            return error
        }

        const data = error.data
        const message = error.message || 'An error occured'
        const code = error.originalError.code || 500
        return {data: data, message: message, status: code}
    },
    context: async({req}) => ({req})
})

// using authorization checking middleware
app.use(auth)

async function startServer() {
    await server.start()

    app.use('/graphql', cors(), bodyParser(), expressMiddleware(server, {
        context: ({req}) => {return {req}}
    }))

    app.listen(3000, () => {
        console.log('Server is running')
    })

    const uri = `mongodb+srv://${process.env.MONGOBD_USER}:${process.env.MONGODB_PASSWORD}@cluster0.xmbmroe.mongodb.net/${process.env.DEFAULT_DB}`

    await mongoose.connect(uri)
    console.log('db connected')
}

startServer()