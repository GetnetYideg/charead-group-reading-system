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

fileRouter.post('/upload', authMiddleware, upload, uploadFile)
fileRouter.get('/metadata/:id', authMiddleware, getFileMetadata)
fileRouter.get('/download/:id',authMiddleware, downloadFile)
fileRouter.delete('/delete/:id', authMiddleware, deleteFile)

export default fileRouter