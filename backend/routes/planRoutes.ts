import { Router } from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This route is public so the landing page can display plans.
router.route('/')
    .get(getPlans)
    // The POST route to create a plan remains protected.
    .post(protect, authorize('Super Admin'), createPlan);

// These routes for updating and deleting remain protected.
router.route('/:id')
    .put(protect, authorize('Super Admin'), updatePlan)
    .delete(protect, authorize('Super Admin'), deletePlan);

export default router;
