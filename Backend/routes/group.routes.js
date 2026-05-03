import express from 'express'
import authMiddleware from "../middlewares/auth.midleware.js"
import {
    createGroup, 
    deleteGroup, 
    getUsersGroup, 
    joinGroup, 
    searchGroups, 
    searchGroupsById
} from "../controllers/group.controller.js"

const groupRouter = express.Router()

groupRouter.post('/groups', authMiddleware, createGroup)
groupRouter.get('/groups', authMiddleware, getUsersGroup)
groupRouter.get('/groups/:id', authMiddleware, searchGroupsById)
groupRouter.get('/groups/:slug', authMiddleware, searchGroups)
groupRouter.post('/groups/:id/join', authMiddleware, joinGroup)
groupRouter.delete('/groups/:id', authMiddleware, deleteGroup)

export default groupRouter