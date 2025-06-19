import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import ShareableLink from '../models/ShareableLink';
import Expense from '../models/Expense'; // We need this to find the document URL
import path from 'path';

// @desc    Create a secure, shareable link for a document
// @route   POST /api/share/expense-document/:expenseId
export const createShareLink = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const expense = await Expense.findById(req.params.expenseId);
        
        // Security check: ensure the expense exists, has a document, and belongs to the user's organization
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

// @desc    Access a shared document using a token
// @route   GET /api/share/view/:token
export const viewSharedDocument = async (req: Request, res: Response) => {
    try {
        const link = await ShareableLink.findOne({ 
            token: req.params.token,
            expiresAt: { $gt: new Date() } // Check if the link has expired
        });

        if (!link) {
            return res.status(404).send('<h1>Link is invalid or has expired</h1>');
        }

        // IMPORTANT: For this to work, you must have a static file server configured to serve the 'public' directory
        // We will add this to server.ts in the next step.
        const filePath = path.join(__dirname, '..', 'public', link.documentUrl);
        
        // This will send the file to the user's browser
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
