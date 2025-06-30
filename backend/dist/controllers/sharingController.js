"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewSharedDocument = exports.createShareLink = void 0;
const ShareableLink_1 = __importDefault(require("../models/ShareableLink"));
const Expense_1 = __importDefault(require("../models/Expense"));
const path_1 = __importDefault(require("path"));
const createShareLink = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const expense = await Expense_1.default.findById(req.params.expenseId);
        if (!expense || !expense.documentUrl || expense.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Document not found or access denied.' });
            return;
        }
        const newLink = await ShareableLink_1.default.create({
            documentUrl: expense.documentUrl,
            organizationId: req.user.organizationId,
        });
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/view-document/${newLink.token}`;
        res.status(201).json({ success: true, shareUrl });
    }
    catch (error) {
        console.error("Error creating share link:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.createShareLink = createShareLink;
const viewSharedDocument = async (req, res) => {
    try {
        const link = await ShareableLink_1.default.findOne({
            token: req.params.token,
            expiresAt: { $gt: new Date() }
        });
        if (!link) {
            res.status(404).send('<h1>Link is invalid or has expired</h1>');
            return;
        }
        const filePath = path_1.default.join(__dirname, '..', 'public', link.documentUrl);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error("File serving error:", err);
                res.status(404).send('<h1>Document not found</h1>');
            }
        });
    }
    catch (error) {
        console.error("Error viewing shared document:", error);
        res.status(500).send('<h1>Server Error</h1>');
    }
};
exports.viewSharedDocument = viewSharedDocument;
