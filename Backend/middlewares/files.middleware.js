import multer from "multer";

const storage = multer.memoryStorage();
    
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}).single('file')