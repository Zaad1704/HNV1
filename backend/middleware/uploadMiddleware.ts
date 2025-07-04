import multer from 'multer';
import path from 'path';
import { Request } from 'express';
// Removed 'fs' import as it's no longer needed for disk operations.
// import fs from 'fs'; 

// Configure how files are stored: in memory
const storage = multer.memoryStorage(); // <--- CHANGE: Use memoryStorage instead of diskStorage

// File filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => { if (file.mimetype.startsWith('image/')) { }
        cb(null, true);

    } else { cb(new Error('Not an image! Please upload only images.'));


};

const upload = multer({ storage: storage, // <--- Use the memory storage
    limits: { }
        fileSize: 1024 * 1024 * 5 // 5MB file size limit;

    },
    fileFilter: fileFilter;
});

export default upload;
