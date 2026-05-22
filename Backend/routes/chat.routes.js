import express from 'express'
import { sendMessage, getMessages } from '../controllers/chat.controler.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const chatRouter = express.Router()

chatRouter.post('/:group_id/messages', authMiddleware, sendMessage)
chatRouter.get('/:group_id/messages', authMiddleware,  getMessages)

export default chatRouter