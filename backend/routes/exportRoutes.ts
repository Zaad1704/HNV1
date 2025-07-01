import { Router } from 'express';
import {
  createExportRequest,
  getExportStatus,
  downloadExport,
  getExportTemplates,
  createExportTemplate,
  updateExportTemplate,
  deleteExportTemplate,
  cleanupExpiredExports
} from '../controllers/exportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// All export routes require authentication
router.use(protect);

// Export request management
router.post('/request', createExportRequest);
router.get('/status/:id', getExportStatus);
router.get('/download/:id', downloadExport);

// Template management
router.get('/templates', getExportTemplates);
router.post('/templates', authorize(['Landlord', 'Agent']), createExportTemplate);
router.put('/templates/:id', authorize(['Landlord', 'Agent']), updateExportTemplate);
router.delete('/templates/:id', authorize(['Landlord', 'Agent']), deleteExportTemplate);

// Admin cleanup
router.delete('/cleanup', authorize(['Super Admin']), cleanupExpiredExports);

export default router;