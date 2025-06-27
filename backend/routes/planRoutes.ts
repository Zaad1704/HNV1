import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getPlans, createPlan, updatePlan, deletePlan, getPublicPlans } from '../controllers/planController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

// Public route for fetching plans on landing page
router.get('/public', asyncHandler(getPublicPlans));

router.route('/')
    .get(protect, authorize(['Super Admin']), asyncHandler(getPlans))
    .post(protect, authorize(['Super Admin']), asyncHandler(createPlan));

router.route('/:id')
    .put(protect, authorize(['Super Admin']), asyncHandler(updatePlan))
    .delete(protect, authorize(['Super Admin']), asyncHandler(deletePlan));

export default router;
