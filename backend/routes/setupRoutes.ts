import { Router } from 'express';
import { createSuperAdmin } from '../controllers/setupController';

const router = Router();

// @route   POST /api/setup/create-super-admin
// @desc    A one-time use route to create the initial Super Admin account
// @access  Private (requires secret key)
router.post('/create-super-admin', createSuperAdmin);

export default router;
