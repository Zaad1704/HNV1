// backend/controllers/sharingController.ts
import { Response } from 'express';
import ShareableLink from '../models/ShareableLink';
import Expense from '../models/Expense';
import path from 'path';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const createShareLink = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }

    try {
        const expense = await Expense.findById(req.params.expenseId);
        
        if (!expense || !expense.documentUrl || expense.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
        }

        const newLink = await ShareableLink.create({
            documentUrl: expense.documentUrl,
            organizationId: req.user.organizationId,
        });

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/view-document/${newLink.token}`;

        res.status(201).json({ success: true, shareUrl });

    } catch (error) {
        console.error("Error creating share link:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const viewSharedDocument = async (req: Request, res: Response) => {
    try {
        const link = await ShareableLink.findOne({ 
            token: req.params.token,
            expiresAt: { $gt: new Date() }
        });

        if (!link) {
            return res.status(404).send('<h1>Link is invalid or has expired</h1>');
        }

        const filePath = path.join(__dirname, '..', 'public', link.documentUrl);
        
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error("File serving error:", err);
                res.status(404).send('<h1>Document not found</h1>');
            }
        });

    } catch (error) {
        console.error("Error viewing shared document:", error);
        res.status(500).send('<h1>Server Error</h1>');
    }
};
