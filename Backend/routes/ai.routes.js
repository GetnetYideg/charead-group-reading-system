import express from 'express'
import { aiService } from '../controllers/ai.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const aiRouter = express.Router()

aiRouter.post('/', authMiddleware, aiService)

export default aiRouter