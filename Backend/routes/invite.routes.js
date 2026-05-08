import express from 'express'
import authMiddleware from '../middlewares/auth.midleware.js'
import { acceptInvitations, getInvitations, sendInvitation } from '../controllers/invite.controller.js'

const invitationRouter = express.Router()

invitationRouter.get('/', authMiddleware, getInvitations)
invitationRouter.post('/', authMiddleware, sendInvitation)
invitationRouter.get('/:group_id', authMiddleware, acceptInvitations)

export default invitationRouter