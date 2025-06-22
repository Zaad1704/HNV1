// backend/routes/reminderRoutes.ts

import { Router } from 'express';
import { 
    createReminder, 
    getReminders, 
    updateReminder, 
    deleteReminder,
    processOverdueReminders // Only for internal/admin usage
} from '../controllers/reminderController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Routes for CRUD operations on reminders (for Landlord/Agent)
router.route('/')
    .post(protect, authorize(['Landlord', 'Agent']), createReminder)
    .get(protect, authorize(['Landlord', 'Agent', 'Super Admin']), getReminders); // Super Admin can also view

router.route('/:id')
    .put(protect, authorize(['Landlord', 'Agent']), updateReminder)
    .delete(protect, authorize(['Landlord', 'Agent']), deleteReminder);

// Route for internal cron job to trigger reminder processing
// IMPORTANT: This route needs very strong protection in production (e.g., API key, IP whitelist)
router.post('/process-overdue', processOverdueReminders); // This can be protected later with a custom middleware or specific key check

export default router;
