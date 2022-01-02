const express = require('express')
const router = express.Router()

const login = require('./login')
const logout = require('./logout')
const register = require('./register')

router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register)


module.exports = router
