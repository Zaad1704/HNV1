// backend/routes/reminderRoutes.ts

import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createReminder, 
    getReminders, 
    updateReminder, 
    deleteReminder,
    processOverdueReminders; }

} from '../controllers/reminderController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Routes for CRUD operations on reminders (for Landlord/Agent)
router.route('/')
    .post(protect, authorize(['Landlord', 'Agent']), asyncHandler(createReminder))
    .get(protect, authorize(['Landlord', 'Agent', 'Super Admin']), asyncHandler(getReminders)); 

router.route('/:id')
    .put(protect, authorize(['Landlord', 'Agent']), asyncHandler(updateReminder))
    .delete(protect, authorize(['Landlord', 'Agent']), asyncHandler(deleteReminder));

// Route for internal cron job to trigger reminder processing
// IMPORTANT: This route needs very strong protection in production (e.g., API key, IP whitelist)
router.post('/process-overdue', asyncHandler(processOverdueReminders)); 

export default router;
