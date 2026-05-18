import express from 'express'
import authMiddleware from "../middlewares/auth.middleware.js"
import {
    createGroup, 
    deleteGroup, 
    getUsersGroup, 
    joinGroup, 
    searchGroups, 
    searchGroupsById,
    listFiles
} from "../controllers/group.controller.js"

const groupRouter = express.Router()

groupRouter.post('/', authMiddleware, createGroup)
groupRouter.get('/', authMiddleware, getUsersGroup)
groupRouter.get('/:id', authMiddleware, searchGroupsById)
groupRouter.get('/:slug', authMiddleware, searchGroups)
groupRouter.get('/:slug/files', authMiddleware, listFiles)
groupRouter.post('/:slug/join', authMiddleware, joinGroup)
groupRouter.delete('/:id', authMiddleware, deleteGroup)
export default groupRouter