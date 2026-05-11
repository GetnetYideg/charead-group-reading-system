import express from 'express'
import { register, login , logout, githubOauth, githubOauthCallback,googleOauth } from '../controllers/auth.controller.js'
import authMiddleware from '../middlewares/auth.midleware.js'

const authRouter = express.Router()

authRouter.post('/register', register, )
authRouter.post('/oauth/github', githubOauth)
authRouter.get('/oauth/github/callback', githubOauthCallback)
authRouter.post('/oauth/google', googleOauth)
authRouter.post('/login', login)
authRouter.post('/logout', authMiddleware,logout)

export default authRouter