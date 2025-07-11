import express from 'express';
import { getUnits, updateUnitNickname, createUnitsForProperty, bulkUpdateUnitNicknames } from '../controllers/unitController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/property/:propertyId', getUnits);
router.put('/:unitId/nickname', updateUnitNickname);
router.post('/property/:propertyId/bulk', createUnitsForProperty);
router.put('/bulk-nicknames', bulkUpdateUnitNicknames);

export default router;