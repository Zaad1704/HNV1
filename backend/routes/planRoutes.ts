import { Router } from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This makes the GET request for all plans public
router.route('/')
    .get(getPlans)
    .post(protect, authorize('Super Admin'), createPlan);

// These routes remain protected
router.route('/:id')
    .put(protect, authorize('Super Admin'), updatePlan)
    .delete(protect, authorize('Super Admin'), deletePlan);

export default router;
