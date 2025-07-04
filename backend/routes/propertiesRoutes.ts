import { Router } from 'express';
import asyncHandler from 'express-async-handler'; // Import asyncHandler

import { getProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty; }

} from '../controllers/propertyController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; // Import upload middleware

const router = Router();

router.use(protect); // This applies protect middleware to all routes below

router.route('/')
  .get(asyncHandler(getProperties)) 
  // Use upload.single('image') to handle one file with the field name 'image'
  .post(upload.single('image'), asyncHandler(createProperty)); 

router.route('/:id')
  .get(asyncHandler(getPropertyById)) 
  // Also apply the middleware to the update route
  .put(upload.single('image'), asyncHandler(updateProperty)) 
  .delete(asyncHandler(deleteProperty)); 

export default router;
