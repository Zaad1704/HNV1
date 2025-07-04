import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getEditRequests, createEditRequest, updateEditRequest } from '../controllers/editRequestController';

const router = Router();

router.use(protect);

router.get('/', getEditRequests);
router.post('/', createEditRequest);
router.put('/:id', updateEditRequest);

export default router;