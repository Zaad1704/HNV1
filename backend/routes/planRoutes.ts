import { Router } from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are protected and require a Super Admin role.
router.use(protect, authorize('Super Admin'));

router.route('/')
    .get(getPlans)
    .post(createPlan);

router.route('/:id')
    .put(updatePlan)
    .delete(deletePlan);

export default router;
