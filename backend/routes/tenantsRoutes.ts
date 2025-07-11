import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { cascadeTenantChanges } from '../middleware/cascadeMiddleware';
import upload from '../middleware/uploadMiddleware';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantDataPreviews,
  getTenantStats,
  getTenantAnalytics,
  archiveTenant,
  downloadTenantPDF,
  downloadTenantDataZip,
  downloadPersonalDetailsPDF
} from '../controllers/tenantsController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getTenants)
  .post(upload.fields([
    { name: 'tenantImage', maxCount: 1 },
    { name: 'govtIdFront', maxCount: 1 },
    { name: 'govtIdBack', maxCount: 1 },
    { name: 'additionalAdultImage_0', maxCount: 1 },
    { name: 'additionalAdultImage_1', maxCount: 1 },
    { name: 'additionalAdultImage_2', maxCount: 1 },
    { name: 'additionalAdultGovtId_0', maxCount: 1 },
    { name: 'additionalAdultGovtId_1', maxCount: 1 },
    { name: 'additionalAdultGovtId_2', maxCount: 1 }
  ]), createTenant);

router.route('/:id')
  .get(getTenantById)
  .put(updateTenant)
  .delete(async (req: any, res) => {
    try {
      await cascadeTenantChanges(req.params.id, 'delete', req.user.organizationId);
      deleteTenant(req, res);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to cascade tenant deletion' });
    }
  });

// Archive tenant
router.patch('/:id/archive', archiveTenant);

// PDF Downloads
router.post('/:id/download-pdf', downloadTenantPDF);
router.post('/:id/personal-details-pdf', downloadPersonalDetailsPDF);
router.post('/:id/download-zip', downloadTenantDataZip);

// NEW DATA PREVIEW ROUTES
router.get('/:tenantId/data-previews', getTenantDataPreviews);
router.get('/:tenantId/stats', getTenantStats);
router.get('/:tenantId/analytics', getTenantAnalytics);

export default router;
