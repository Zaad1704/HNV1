mport { Router } from 'express';
import { getProfile, updateUserDetails, updateUserPassword } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const userRouter = Router();
userRouter.get("/me", protect, getProfile);
userRouter.put('/details', protect, updateUserDetails);
userRouter.put('/password', protect, updateUserPassword);
export default userRouter;
