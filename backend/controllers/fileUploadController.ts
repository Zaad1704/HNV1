import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const uploadImage = (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Construct the public URL for the uploaded file
    // Note: The base URL should come from an environment variable in a real production app.
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5001'}/uploads/${req.file.filename}`;

    res.status(200).json({
        success: true,
        message: 'File uploaded successfully.',
        imageUrl: fileUrl
    });
};
