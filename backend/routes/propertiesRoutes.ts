import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getPropertyDataPreviews,
  getUnitData
} from '../controllers/propertyController';
import { protect } from '../middleware/authMiddleware';
import { cascadePropertyChanges } from '../middleware/cascadeMiddleware';

const router = Router();

router.use(protect);

router.route('/')
  .get(getProperties)
  .post(createProperty);

router.route('/:id')
  .get(getPropertyById)
  .put(updateProperty)
  .delete(async (req: any, res) => {
    try {
      await cascadePropertyChanges(req.params.id, 'delete', req.user.organizationId);
      deleteProperty(req, res);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to cascade property deletion' });
    }
  });

// Archive property
router.patch('/:id/archive', async (req: any, res) => {
  try {
    await cascadePropertyChanges(req.params.id, 'archive', req.user.organizationId);
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

export default router;