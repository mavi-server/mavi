import express from 'express'
const router = express.Router()

import login from './login'
import logout from './logout'
import register from './register'

router.post('/login', login)
router.post('/logout', logout)
router.post('/register', register)


export default router
