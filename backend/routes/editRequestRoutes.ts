import { Router } from 'express';
import {
    createEditRequest,
    getEditRequests,
    approveEditRequest,
    rejectEditRequest
} from '../controllers/editRequestController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// All routes in this file require an authenticated user
router.use(protect);

// Agent creates a request
router.post('/', authorize(['Agent']), createEditRequest);

// Landlord gets a list of their pending requests
router.get('/', authorize(['Landlord']), getEditRequests);

// Landlord approves or rejects a specific request
router.put('/:id/approve', authorize(['Landlord']), approveEditRequest);
router.put('/:id/reject', authorize(['Landlord']), rejectEditRequest);

export default router;
