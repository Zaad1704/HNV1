import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'; 
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose'; 

const router = require('express').Router(); 

router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

router.get('/', asyncHandler(async (req: Request, res: Response) => { 
    const authenticatedUser = req.user as import('../middleware/authMiddleware').AuthenticatedRequest['user'];

    const { userId, action, startDate, endDate } = req.query;

    const query: any = {
        organizationId: authenticatedUser?.organizationId
    };
    
    if (userId) {
        query.user = userId;
    }
    if (action) {
        query.action = { $regex: action, $options: 'i' }; 
    }
    if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }

    const logs = await AuditLog.find(query)
                               .populate('user', 'name email')
                               .sort({ timestamp: -1 })
                               .limit(200); 

    res.status(200).json({ success: true, data: logs });
}));

export default router;
