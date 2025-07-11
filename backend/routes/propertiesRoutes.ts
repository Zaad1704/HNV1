import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyDataPreviews,
  getUnitData,
  validateDataIntegrity,
  regenerateDescription,
  getPropertyUnits
} from '../controllers/propertyController';
import { getVacantUnits } from '../controllers/unitController';
import { protect } from '../middleware/authMiddleware';
import { cascadePropertyChanges } from '../middleware/cascadeMiddleware';
import upload from '../middleware/uploadMiddleware';
import { IUser } from '../models/User';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProperties)
  .post(upload.single('image'), createProperty);

router.route('/:id')
  .get(getPropertyById)
  .put(upload.single('image'), updateProperty)
  .delete(async (req: any, res) => {
    try {
      await cascadePropertyChanges(req.params.id, 'delete', (req.user as IUser)?.organizationId);
      deleteProperty(req, res);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to cascade property deletion' });
    }
  });

// Archive property
router.patch('/:id/archive', async (req: any, res) => {
  try {
    await cascadePropertyChanges(req.params.id, 'archive', (req.user as IUser)?.organizationId);
    const Property = require('../models/Property').default;
    await Property.findByIdAndUpdate(req.params.id, { status: 'Archived' });
    res.status(200).json({ success: true, message: 'Property and related data archived' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to archive property' });
  }
});

// NEW DATA PREVIEW ROUTES
router.get('/:propertyId/data-previews', getPropertyDataPreviews);
router.get('/:propertyId/units/:unitNumber/data', getUnitData);
router.get('/:propertyId/units', getPropertyUnits);
router.get('/:propertyId/vacant-units', getVacantUnits);

// DATA VALIDATION ROUTE
router.get('/validate/data-integrity', validateDataIntegrity);

// REGENERATE DESCRIPTION ROUTE
router.put('/:id/regenerate-description', regenerateDescription);

export default router;