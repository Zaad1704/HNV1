// backend/routes/communicationRoutes.ts

import { Router } from 'express';
import { sendCustomEmail, sendRentReminder } from '../controllers/communicationController'; // NEW IMPORT: sendRentReminder
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Route for sending custom emails
router.post('/email', protect, authorize(['Landlord', 'Agent']), sendCustomEmail);

// NEW ROUTE for C.1: Send Rent Reminder
router.post('/send-rent-reminder', protect, authorize(['Landlord', 'Agent']), sendRentReminder);

export default router;
