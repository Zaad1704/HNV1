import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import Plan from '../models/Plan'; 

const router = Router();

// Public route for getting public plans
router.get('/public', asyncHandler(async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isPublic: true }).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });

}));

router.route('/')
    .get(asyncHandler(getPlans)) 
    .post(protect, authorize(['Super Admin']), asyncHandler(createPlan));

router.route('/:id')
    .put(protect, authorize(['Super Admin']), asyncHandler(updatePlan))
    .delete(protect, authorize(['Super Admin']), asyncHandler(deletePlan));

export default router;
