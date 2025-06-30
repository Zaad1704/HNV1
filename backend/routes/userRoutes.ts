import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrgUsers,
  getManagedAgents,
  updatePassword,
  requestAccountDeletion 
} from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.put('/update-password', asyncHandler(updatePassword));
router.post('/request-deletion', asyncHandler(requestAccountDeletion));

router.route('/')
  .get(authorize('Super Admin'), asyncHandler(getUsers));

router
  .route('/:id')
  .get(authorize('Super Admin'), asyncHandler(getUser))
  .put(authorize('Super Admin'), asyncHandler(updateUser))
  .delete(authorize('Super Admin'), asyncHandler(deleteUser));

router.get('/organization', authorize('Super Admin', 'Landlord', 'Agent'), asyncHandler(getOrgUsers)); 
router.get('/my-agents', authorize('Super Admin', 'Landlord'), asyncHandler(getManagedAgents));

// Add missing user endpoints
router.get('/my-agents', protect, asyncHandler(async (req: Request, res: Response) => {
  const agents = await User.find({
    organizationId: req.user?.organizationId,
    role: 'Agent',
    status: 'active'
  }).select('name email _id');
  
  res.json({ success: true, data: agents });
}));

export default router;
