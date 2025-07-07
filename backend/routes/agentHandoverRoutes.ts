import express from 'express';
import { createAgentHandover, getAgentHandovers, updateHandoverStatus } from '../controllers/agentHandoverController';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Agent handover routes
router.post('/', upload.fields([
  { name: 'handoverProof', maxCount: 1 },
  { name: 'collectionSheet', maxCount: 1 }
]), createAgentHandover);

router.get('/', getAgentHandovers);
router.put('/:id/status', updateHandoverStatus);

export default router;