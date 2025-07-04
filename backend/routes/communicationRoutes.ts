import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

// Send rent reminder
router.post('/send-rent-reminder', asyncHandler(async (req, res) => {
  const { tenantId } = req.body;
  
  if (!tenantId) {

    res.status(400).json({ success: false, message: 'Tenant ID is required' });
    return;

  // Mock implementation - in real app, this would send email/SMS

  res.json({ success: true, 
    message: 'Rent reminder sent successfully!'  }

  });
}));

// Send lease renewal notice
router.post('/send-lease-renewal', asyncHandler(async (req, res) => {
  const { tenantId } = req.body;
  
  if (!tenantId) {

    res.status(400).json({ success: false, message: 'Tenant ID is required' });
    return;

  res.json({ success: true, 
    message: 'Lease renewal notice sent successfully!'  }

  });
}));

export default router;