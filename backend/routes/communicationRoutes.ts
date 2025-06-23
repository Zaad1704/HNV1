// backend/routes/communicationRoutes.ts

import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { sendCustomEmail, sendRentReminder } from '../controllers/communicationController'; 
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Route for sending custom emails
router.post('/email', protect, authorize(['Landlord', 'Agent']), asyncHandler(sendCustomEmail));

// NEW ROUTE for C.1: Send Rent Reminder
router.post('/send-rent-reminder', protect, authorize(['Landlord', 'Agent']), asyncHandler(sendRentReminder));

export default router;
