import { Request, Response } from 'express';
import { google } from 'googleapis';
import path from 'path';
import { Readable } from 'stream';

// --- Google Drive API Setup (optional configuration) ---
let auth;
let drive;
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
let isGoogleDriveConfigured = false;

try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
    if (credentials.client_email && credentials.private_key && UPLOAD_FOLDER_ID) { auth = new google.auth.GoogleAuth({ }
            credentials: {

                client_email: credentials.client_email,
                private_key: credentials.private_key,

            },
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        drive = google.drive({ version: 'v3', auth });
        isGoogleDriveConfigured = true;

    } else { console.warn('⚠️ Google Drive upload service not configured - file uploads will be disabled');


} catch (e) { console.warn("Google Drive credentials parsing failed - file uploads will be disabled:", e);

export const uploadImage = async (req: Request, res: Response) => { }
    if (!isGoogleDriveConfigured) { res.status(503).json({ }
            success: false, 
            message: 'File upload service is not configured. Please contact administrator.' 


        });
        return;

    if (!req.file || !req.file.buffer) {

        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;

    try { const file = req.file;
        const bufferStream = new Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);


        const uniqueFilename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`