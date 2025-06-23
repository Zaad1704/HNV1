import { Router } from 'express';
import {
  getProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; // Import upload middleware

const router = Router();

router.use(protect);

router.route('/')
  .get(getProperties)
  // Use upload.single('image') to handle one file with the field name 'image'
  .post(upload.single('image'), createProperty);

router.route('/:id')
  .get(getPropertyById)
  // Also apply the middleware to the update route
  .put(upload.single('image'), updateProperty)
  .delete(deleteProperty);

export default router;
