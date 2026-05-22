import express from 'express'
import {upload} from '../middlewares/files.middleware.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import { 
    isAdminMiddleware, 
    isMemberMiddleware 
} from '../middlewares/group.middleware.js'
import { 
    uploadFile,
    getFileMetadata,
    downloadFile,
    deleteFile
} from '../controllers/file.controller.js'

const fileRouter = express.Router()

fileRouter.post('/upload', authMiddleware, isAdminMiddleware, upload, uploadFile)
fileRouter.get('/metadata/:id', authMiddleware, getFileMetadata)
fileRouter.get('/download/:id', downloadFile)
fileRouter.delete('/delete/:id', authMiddleware, isAdminMiddleware, isMemberMiddleware, deleteFile)

export default fileRouter