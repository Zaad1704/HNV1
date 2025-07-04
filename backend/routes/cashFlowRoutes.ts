import { Router } from 'express';
import { createCashFlowRecord,
  getCashFlowRecords,
  updateCashFlowRecord,
  deleteCashFlowRecord; }

} from '../controllers/cashFlowController';
import uploadMiddleware from '../middleware/uploadMiddleware';

const router = Router();

// Get all cash flow records
router.get('/', getCashFlowRecords);

// Create new cash flow record
router.post('/', uploadMiddleware.single('document'), createCashFlowRecord);

// Update cash flow record
router.put('/:id', updateCashFlowRecord);

// Delete cash flow record
router.delete('/:id', deleteCashFlowRecord);

export default router;