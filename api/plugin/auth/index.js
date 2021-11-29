import express from 'express'
const router = express.Router()

import login from './login.js'
import logout from './logout.js'
import register from './register.js'

router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register)


export default router
