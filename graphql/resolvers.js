const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const resolvers = {
    Query: {
        // resolver for getting certain user (not used in api)
        getUser: async (_, {id}) => {
            // const errors = []
            const user = await User.findById(id)

            if(!user) {
                throw new Error('No user with this id')
            }

            return {
                ...user._doc,
                _id: id.toString(),
                email: user.email,
                name: user.name
            }
        },
        // resolver for user login
        login: async (_, { email, password }, { req }) => {
          try {
            // storing errors in array to display them on UI
            const errors = []

            if (validator.isEmpty(email)) {
                errors.push({ message: 'Please type your e-mail' })
            }
            // checking if user exists
            const user = await User.findOne({ email: email })
        
            if (!user) {
              errors.push({ message: 'No user with this email found, please type a valid e-mail or signup' })
            }

            if(validator.isEmpty(password)) {
                errors.push({message: 'Please type your password'})
            }
            // comparing stored hashed password with password typed by user
            const isValid = await bcrypt.compare(password, user.password);
        
            if (!isValid) {
              errors.push({ message: 'Wrong password!' })
            }

            if (errors.length > 0) {
              const error = new Error('Invalid input')
              error.data = errors
              error.code = 422
              throw error
            }
            // creating jwt token for logged user
            const token = jwt.sign({
                email: user.email,
                userId: user._id.toString(),
              },
              'starwarssequeltrilogysucks',
              { expiresIn: '1h' }
            );
            // returning token and user id
            return { token: token, userId: user._id.toString() }
          } catch (error) {
            throw error;
          }
        }
    },

    Mutation: {
        // resolver for user signup
        createUser: async(_, {userData}) => {
            const errors = []
            // validating all form fields
            if(!validator.isEmail(userData.email)) {
                errors.push({message: 'Invalid e-mail'})
            }

            if(validator.isEmpty(userData.password) || !validator.isLength(userData.password, {min: 5})) {
                errors.push({message: 'Password too short'})
            }

            if(validator.isEmpty(userData.name)) {
                errors.push({message: 'Username is required'})
            }

            if(errors.length > 0) {
                const error = new Error('Invalid input')
                error.data = errors
                error.code = 422
                throw error
            }
            // checking if user with this e-mail exists already 
            const existingUser = await User.findOne({email: userData.email})

            if(existingUser) {
                const error = new Error('User with this email exists already')
                throw error
            }

            // hashing user password
            const hashedPassword = await bcrypt.hash(userData.password, 12)
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword
            })

            // saving new user to db and returning his doc and id
            const newUser = await user.save()
            return {...newUser._doc, _id: newUser._id.toString()}
        }
    }
}

module.exports = resolvers