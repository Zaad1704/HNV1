import { Request, Response } from 'express';
import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream'; // Import the Readable stream class

// --- Google Drive API Setup (remains the same) ---
let auth;
try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
    auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
} catch (e) {
    console.error("FATAL ERROR: Failed to parse Google credentials from GOOGLE_CREDENTIALS_JSON env var. Ensure it's correctly set.", e);
    throw new Error("Google Drive credentials are not correctly configured. Check GOOGLE_CREDENTIALS_JSON environment variable.");
}

const drive = google.drive({ version: 'v3', auth });
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;

if (!UPLOAD_FOLDER_ID) {
    console.error("FATAL ERROR: GOOGLE_DRIVE_UPLOAD_FOLDER_ID environment variable is not defined.");
    throw new Error("Google Drive upload folder ID is not configured.");
}


export const uploadImage = async (req: Request, res: Response) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ success: false, message: 'No file uploaded or file buffer is empty.' });
    }

    try {
        const file = req.file;

        // --- FIX: Convert Buffer to a Readable Stream ---
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null); // Signals the end of the stream

        const uniqueFilename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;

        const response = await drive.files.create({
            requestBody: {
                name: uniqueFilename,
                parents: [UPLOAD_FOLDER_ID],
                mimeType: file.mimetype,
            },
            media: {
                mimeType: file.mimetype,
                body: bufferStream, // Use the new stream here instead of file.buffer
            },
            fields: 'id',
        });

        const fileId = response.data.id;

        if (!fileId) {
            return res.status(500).json({ success: false, message: 'Failed to obtain file ID from Google Drive after upload.' });
        }

        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        const directEmbeddableUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Google Drive.',
            imageUrl: directEmbeddableUrl
        });

    } catch (error: any) {
        console.error('Error uploading file to Google Drive:', error);
        let errorMessage = 'Failed to upload file to Google Drive.';
        if (error.code && error.errors) {
            errorMessage = `Google Drive API Error: ${error.errors[0]?.message || error.message}`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        res.status(500).json({ success: false, message: errorMessage });
    }
};
