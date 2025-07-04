import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { uploadImage, handleImageUpload } from '../controllers/uploadController';

const router = Router();

router.use(protect);

router.post('/image', uploadImage, handleImageUpload);

export default router;