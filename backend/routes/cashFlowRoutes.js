"use strict";
// backend/routes/cashFlowRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cashFlowController_1 = require("../controllers/cashFlowController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const googleapis_1 = require("googleapis"); // Imported here for direct use in middleware
const path_1 = __importDefault(require("path")); // Imported here for direct use in middleware
const router = (0, express_1.Router)();
// All cash flow routes require authentication
router.use(authMiddleware_1.protect);
// Route for creating a cash flow record
router.post('/', (0, rbac_1.authorize)(['Agent']), uploadMiddleware_1.default.single('document'), async (req, res, next) => {
    if (req.file) {
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
            console.error("Failed to parse Google credentials for cash flow upload:", e);
            return res.status(500).json({ success: false, message: "Google Drive credentials not configured." });
        }
        const drive = googleapis_1.google.drive({ version: 'v3', auth });
        const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID;
        if (!UPLOAD_FOLDER_ID) {
            return res.status(500).json({ success: false, message: "Google Drive upload folder ID not defined." });
        }
        const uniqueFilename = `cashflow-${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path_1.default.extname(req.file.originalname)}`;
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
        req.file.imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    next();
}, (0, express_async_handler_1.default)(cashFlowController_1.createCashFlowRecord));
// Route for getting cash flow records
router.get('/', (0, rbac_1.authorize)(['Agent', 'Landlord', 'Super Admin']), (0, express_async_handler_1.default)(cashFlowController_1.getCashFlowRecords));
exports.default = router;
//# sourceMappingURL=cashFlowRoutes.js.map