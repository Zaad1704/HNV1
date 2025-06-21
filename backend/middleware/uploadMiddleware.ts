import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs'; // Import the file system module

// Configure how files are stored
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads'); // Define absolute path
        
        // Ensure the directory exists. Create it if it doesn't.
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // `recursive: true` ensures parent directories are also created
        }
        cb(null, uploadPath); // Pass the absolute path to Multer
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});

export default upload;
