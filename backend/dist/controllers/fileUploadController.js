"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
let auth;
try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
    auth = new googleapis_1.google.auth.GoogleAuth({
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
}
catch (e) {
    console.error("FATAL ERROR: Failed to parse Google credentials. Please check the environment variable.", e);
    throw new Error("Google Drive credentials are not correctly configured.");
}
const drive = googleapis_1.google.drive({ version: 'v3', auth });
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
if (!UPLOAD_FOLDER_ID) {
    console.error("FATAL ERROR: GOOGLE_DRIVE_UPLOAD_FOLDER_ID environment variable is not defined.");
    throw new Error("Google Drive upload folder ID is not configured.");
}
const uploadImage = async (req, res) => {
    if (!req.file || !req.file.buffer) {
        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;
    }
    try {
        const file = req.file;
        const bufferStream = new stream_1.Readable();
        bufferStream.push(file.buffer);
        bufferStream.push(null);
        const uniqueFilename = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path_1.default.extname(file.originalname)}`;
        const response = await drive.files.create({
            requestBody: {
                name: uniqueFilename,
                parents: [UPLOAD_FOLDER_ID],
                mimeType: file.mimetype,
            },
            media: {
                mimeType: file.mimetype,
                body: bufferStream,
            },
            fields: 'id',
        });
        const fileId = response.data.id;
        if (!fileId) {
            res.status(500).json({ success: false, message: 'Failed to get file ID from Google Drive.' });
            return;
        }
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Google Drive.',
            imageUrl: thumbnailUrl
        });
    }
    catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        res.status(500).json({ success: false, message: 'Failed to upload file to Google Drive.' });
    }
};
exports.uploadImage = uploadImage;
