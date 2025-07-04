"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShareLink = void 0;
const ShareableLink_1 = __importDefault(require("../models/ShareableLink"));
const Expense_1 = __importDefault(require("../models/Expense"));
const createShareLink = async (req, res) => {
    if (!req.user || !req.user.organizationId) { }
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
    try {
        const expense = await Expense_1.default.findById(req.params.expenseId);
        if (!expense || !expense.documentUrl || expense.organizationId.toString() !== req.user.organizationId.toString()) { }
        res.status(404).json({ success: false, message: 'Document not found or access denied.' });
        return;
        const newLink = await ShareableLink_1.default.create({
            documentUrl: expense.documentUrl,
            organizationId: req.user.organizationId,
        });
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/view-document/${newLink.token}`;
    }
    finally { }
};
exports.createShareLink = createShareLink;
