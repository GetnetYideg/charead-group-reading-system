import express from 'express'
import { 
    register, 
    login, 
    logout, 
    getMe,
    githubOauth, 
    githubOauthCallback, 
    googleOauth, 
    googleOauthCallback } from '../controllers/auth.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const authRouter = express.Router()

authRouter.post('/register', register, )
authRouter.get('/oauth/github', githubOauth)
authRouter.get('/oauth/github/callback', githubOauthCallback)
authRouter.get('/oauth/google', googleOauth)
authRouter.get('/oauth/google/callback', googleOauthCallback)
authRouter.post('/login', login)
authRouter.post('/logout', authMiddleware, logout)
authRouter.get('/me', getMe)

export default authRouter