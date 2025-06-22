// backend/controllers/fileUploadController.ts

import { Request, Response } from 'express';
import { google } from 'googleapis'; // Import googleapis
import path from 'path'; // Needed for path.extname to handle file extensions

// --- Google Drive API Setup ---
// Securely load credentials from environment variable for Render deployment.
// The GOOGLE_CREDENTIALS_JSON environment variable should contain the entire content
// of your Google Service Account JSON key file.
let auth;
try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
    auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/drive'], // Scope for Google Drive access
    });
} catch (e) {
    console.error("FATAL ERROR: Failed to parse Google credentials from GOOGLE_CREDENTIALS_JSON env var. Ensure it's correctly set.", e);
    throw new Error("Google Drive credentials are not correctly configured. Check GOOGLE_CREDENTIALS_JSON environment variable.");
}

const drive = google.drive({ version: 'v3', auth });

// The ID of the Google Drive folder where you want to store uploads.
// This must be set as an environment variable GOOGLE_DRIVE_UPLOAD_FOLDER_ID.
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;

if (!UPLOAD_FOLDER_ID) {
    console.error("FATAL ERROR: GOOGLE_DRIVE_UPLOAD_FOLDER_ID environment variable is not defined.");
    throw new Error("Google Drive upload folder ID is not configured.");
}

// @desc    Upload an image file to Google Drive
// @route   POST /api/upload/image
// @access  Private (Super Admin, Super Moderator)
export const uploadImage = async (req: Request, res: Response) => {
    // Multer now stores the file in req.file.buffer when using memoryStorage()
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ success: false, message: 'No file uploaded or file buffer is empty.' });
    }

    try {
        const file = req.file;
        // Create a unique filename for the uploaded file in Google Drive
        const uniqueFilename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;

        // Step 1: Upload the file to the specified Google Drive folder
        const response = await drive.files.create({
            requestBody: {
                name: uniqueFilename, // Name of the file in Google Drive
                parents: [UPLOAD_FOLDER_ID], // Parent folder ID
                mimeType: file.mimetype, // MIME type of the file
            },
            media: {
                mimeType: file.mimetype,
                body: file.buffer, // Use the file buffer from Multer's memoryStorage
            },
            fields: 'id', // Request only the file ID from the response
        });

        const fileId = response.data.id;

        if (!fileId) {
            return res.status(500).json({ success: false, message: 'Failed to obtain file ID from Google Drive after upload.' });
        }

        // Step 2: Make the uploaded file publicly accessible
        // This is crucial for directly embedding the image on your website.
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader', // Allow anyone to read
                type: 'anyone', // Anyone on the internet
            },
        });

        // Step 3: Construct the direct embeddable URL for the image
        // This format is suitable for <img src="..."> tags.
        const directEmbeddableUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Google Drive.',
            imageUrl: directEmbeddableUrl // Send this URL back to the frontend
        });

    } catch (error: any) {
        console.error('Error uploading file to Google Drive:', error);
        // Provide a more detailed error message if possible
        let errorMessage = 'Failed to upload file to Google Drive.';
        if (error.code && error.errors) {
            // Google API specific errors
            errorMessage = `Google Drive API Error: ${error.errors[0]?.message || error.message}`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        res.status(500).json({ success: false, message: errorMessage });
    }
};
