import { Router } from 'express';
import {
  getProperties,
  createProperty,
  getPropertyById, // Added this import
  updateProperty,
  deleteProperty
} from '../controllers/propertyController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProperties)
  .post(createProperty);

router.route('/:id')
  .get(getPropertyById) // Added this route handler
  .put(updateProperty)
  .delete(deleteProperty);

export default router;
