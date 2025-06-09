// backend/routes/invitationRoutes.ts

import { Router } from 'express';
import * as invitationController from '../controllers/invitationController';

// FIX: Create the router instance
const router = Router();

// Define the routes
router.get('/:token', invitationController.getInvitationInfo);
// router.post('/', invitationController.createInvitation); // Example for another route

// FIX: Export the configured router
export default router;
