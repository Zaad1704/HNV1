// backend/routes/uploadRoutes.ts

import { Router } from 'express';
import { uploadImage } from '../controllers/fileUploadController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// This route is protected and only accessible by admins.
// It uses the 'upload' middleware to process a single file sent with the key 'image'.
router.post(
    '/image', 
    protect, 
    authorize(['Super Admin', 'Super Moderator']), 
    upload.single('image'), 
    uploadImage
);

export default router;
