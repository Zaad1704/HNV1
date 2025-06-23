import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { uploadImage } from '../controllers/fileUploadController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.post('/image', protect, authorize(['Super Admin']), upload.single('image'), asyncHandler(uploadImage));

export default router;
