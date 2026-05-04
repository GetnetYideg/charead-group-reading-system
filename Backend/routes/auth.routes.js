import express from 'express'
import { register, login , logout } from '../controllers/auth.controller.js'
import authMiddleware from '../middlewares/auth.midleware.js'

const authRouter = express.Router()

authRouter.post('/register', register, )
authRouter.post('/login', login)
authRouter.post('/logout', authMiddleware,logout)

export default authRouter