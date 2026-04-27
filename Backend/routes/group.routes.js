import express from 'express'
import authMiddleware from "../middlewares/auth.midleware.js"
import {createGroup} from "../controllers/group.controller.js"

const groupRouter = express.Router()

groupRouter.post('/groups', authMiddleware, createGroup)

export default groupRouter