const jwt = require('jsonwebtoken')
// auth checking middleware
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization')
    // checking if authorization header exists
    if(!authHeader) {
        req.isAuth = false
        return next()
    }

    const token = authHeader.split(' ')[1]
    let decodedToken
    // verifying the jwt token
    try {
        decodedToken = jwt.verify(token, 'starwarssequeltrilogysucks')
    } catch (error) {
        console.log(error)
        req.isAuth = false
        return next()
    }

    if(!decodedToken) {
        req.isAuth = false
        return next()
    }
    //  setting headers, isAuth with boolean property which will define if user is logged or not and userId to store certain logged user
    req.isAuth = true
    req.userId = decodedToken.userId

    next()
}