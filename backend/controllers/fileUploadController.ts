// backend/controllers/fileUploadController.ts
import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    // MODIFIED: Return a relative path instead of a full URL
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        imageUrl: imageUrl 
    });
};
