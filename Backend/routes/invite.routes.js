import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import { acceptInvitations, declineInvitation, getInvitations, sendInvitation } from '../controllers/invite.controller.js'

const invitationRouter = express.Router()

invitationRouter.get('/', authMiddleware, getInvitations)
invitationRouter.post('/', authMiddleware, sendInvitation)
invitationRouter.post('/accepted/:group_id', authMiddleware, acceptInvitations)
invitationRouter.post('/declined/:group_id', authMiddleware, declineInvitation)

export default invitationRouter