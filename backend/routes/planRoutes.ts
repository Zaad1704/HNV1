import { Router } from 'express';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.route('/')
    .get(getPlans)
    .post(protect, authorize(['Super Admin']), createPlan);

router.route('/:id')
    .put(protect, authorize(['Super Admin']), updatePlan)
    .delete(protect, authorize(['Super Admin']), deletePlan);

export default router;
