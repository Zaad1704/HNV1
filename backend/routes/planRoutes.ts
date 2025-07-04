import { Router } from 'express';
import Plan from '../models/Plan';

const router = Router();

// Public route for landing page
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).select('name price features');
    res.json({ success: true, data: plans });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

export default router;
