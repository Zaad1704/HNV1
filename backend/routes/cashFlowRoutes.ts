// backend/routes/cashFlowRoutes.ts

import { Router } from 'express';
import { createCashFlowRecord, getCashFlowRecords } from '../controllers/cashFlowController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware'; // Multer for file uploads
import { uploadImage } from '../controllers/fileUploadController'; // To get imageUrl from Multer output

const router = Router();

// All cash flow routes require authentication
router.use(protect);

// Route for creating a cash flow record
router.post(
    '/',
    authorize(['Agent']), // Only agents can create new cash flow records
    upload.single('document'), // 'document' is the field name for the file input
    // Use a custom middleware or function to process the uploaded file (e.g., to Google Drive)
    // and then attach its URL to req.file or req.body before createCashFlowRecord.
    // For simplicity, we'll use a modified version of uploadImage logic directly here
    // to set req.file.imageUrl, or you could chain it
    async (req, res, next) => {
        // If a file is uploaded, process it via the Google Drive logic
        if (req.file) {
            // Re-use the logic from fileUploadController.ts to upload to Google Drive
            // and attach the imageUrl to req.file or req.body for the controller.
            // This is a slightly simplified way without fully creating a new middleware for it.
            // A more robust solution might be a dedicated 'uploadAndGetUrl' middleware.

            // Simulate fileUploadController.ts's uploadImage logic here
            // Note: This is an abstraction. In a real app, you'd properly chain/reuse Multer storage options
            // and the cloud upload. For simplicity, we directly call the logic from the controller
            // after the file has been parsed by Multer.
            try {
                // Assuming uploadImage controller directly sends response, we need to adapt it.
                // Or, better, refactor your Google Drive upload logic into a reusable middleware
                // that populates req.file.imageUrl or req.body.documentUrl.
                // For now, let's assume req.file.filename will eventually lead to a public URL
                // that createCashFlowRecord can consume.

                // Refactored from fileUploadController.ts for reusability without sending response:
                const { google } = await import('googleapis');
                const path = await import('path');

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
                    console.error("Failed to parse Google credentials for cash flow upload:", e);
                    return res.status(500).json({ success: false, message: "Google Drive credentials not configured." });
                }
                const drive = google.drive({ version: 'v3', auth });
                const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
                if (!UPLOAD_FOLDER_ID) {
                    return res.status(500).json({ success: false, message: "Google Drive upload folder ID not defined." });
                }

                const uniqueFilename = `cashflow-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(req.file.originalname)}`;
                const uploadResponse = await drive.files.create({
                    requestBody: {
                        name: uniqueFilename,
                        parents: [UPLOAD_FOLDER_ID],
                        mimeType: req.file.mimetype,
                    },
                    media: {
                        mimeType: req.file.mimetype,
                        body: req.file.buffer,
                    },
                    fields: 'id',
                });
                const fileId = uploadResponse.data.id;
                if (!fileId) {
                    return res.status(500).json({ success: false, message: 'Failed to get file ID for cash flow document.' });
                }
                await drive.permissions.create({
                    fileId: fileId,
                    requestBody: { role: 'reader', type: 'anyone' },
                });
                // Attach the direct URL to req.file for the controller to pick up
                (req.file as any).imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`; 
            } catch (error) {
                console.error("Error during cash flow document upload:", error);
                return res.status(500).json({ success: false, message: 'Failed to upload cash flow document.' });
            }
        }
        next(); // Proceed to the controller
    },
    createCashFlowRecord
);

// Route for getting cash flow records
router.get(
    '/',
    authorize(['Agent', 'Landlord', 'Super Admin']), // Agents, Landlords, Super Admins can view
    getCashFlowRecords
);

export default router;
