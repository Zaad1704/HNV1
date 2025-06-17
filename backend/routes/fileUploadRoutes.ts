import { Router } from 'express';
import { uploadImage } from '../controllers/fileUploadController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// This route is protected for Super Admins and uses the multer 'upload' middleware
// 'image' is the field name that the frontend form will use.
router.post('/image', protect, authorize('Super Admin'), upload.single('image'), uploadImage);

export default router;
