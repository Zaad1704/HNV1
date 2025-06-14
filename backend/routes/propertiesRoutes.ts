import { Router } from 'express';
import {
  getProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController'; // FIX: Corrected filename from propertiesController
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProperties)
  .post(createProperty);

router.route('/:id')
  .get(getPropertyById)
  .put(updateProperty)
  .delete(deleteProperty);

export default router;
