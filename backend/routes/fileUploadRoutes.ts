import { Router } from 'express';
import { uploadImage } from '../controllers/fileUploadController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.post('/image', protect, authorize(['Super Admin']), upload.single('image'), uploadImage);

export default router;
