// backend/routes/setupRoutes.ts

import { Router } from 'express';
import { createSuperAdmin, createDefaultPlans } from '../controllers/setupController'; // <-- Import new function

const router = Router();

// @route   POST /api/setup/create-super-admin
// @desc    A one-time use route to create the initial Super Admin account
// @access  Private (requires secret key)
router.post('/create-super-admin', createSuperAdmin);

// @route   POST /api/setup/create-default-plans
// @desc    A one-time use route to create the initial subscription plans
// @access  Private (requires secret key)
router.post('/create-default-plans', createDefaultPlans); // <-- Add this new route

export default router;
