import { Request, Response } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose'; // Import mongoose

const router = require('express').Router();

router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId, action, startDate, endDate } = req.query;

        // Start with a base query scoped to the user's organization
        const query: any = {
            organizationId: req.user?.organizationId
        };
        
        // Dynamically add filters to the query if they are provided
        if (userId) {
            query.user = userId;
        }
        if (action) {
            query.action = { $regex: action, $options: 'i' }; // Case-insensitive search
        }
        if (startDate && endDate) {
            query.timestamp = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
        }

        const logs = await AuditLog.find(query)
                                   .populate('user', 'name email')
                                   .sort({ timestamp: -1 })
                                   .limit(200); // Limit results to prevent overload

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
