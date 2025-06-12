import { Router } from 'express';
import {
  getProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty
} from '../controllers/propertiesController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures that only authenticated users can perform actions on properties.
router.use(protect);

// Route for getting all properties for an organization and creating a new one
router.route('/')
  .get(getProperties)
  .post(createProperty);

// Route for getting, updating, or deleting a single property by its ID
router.route('/:id')
  .get(getPropertyById)
  .put(updateProperty)
  .delete(deleteProperty);

export default router;
