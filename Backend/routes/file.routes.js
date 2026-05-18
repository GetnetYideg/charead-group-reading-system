import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import {upload} from '../middlewares/files.middleware.js'
import { 
    uploadFile,
    listFiles,
    getFileMetadata,
    deleteFile,
 } from '../controllers/file.controller.js'

const fileRouter = express.Router()

fileRouter.post('/upload', authMiddleware, upload, uploadFile)

export default fileRouter