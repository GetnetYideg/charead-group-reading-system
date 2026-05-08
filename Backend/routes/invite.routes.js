import express from 'expres'
import authMiddleware from '../middlewares/auth.midleware'
import { acceptInvitations, getInvitations, sendInvitation } from '../controllers/invite.controller'

const invitationRouter = express.Router()

invitationRouter.get('/', authMiddleware, getInvitations)
invitationRouter.post('/', authMiddleware, sendInvitation)
invitationRouter.get('/:group_id', authMiddleware, acceptInvitations)

export default invitationRouter