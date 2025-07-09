import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { cascadeTenantChanges } from '../middleware/cascadeMiddleware';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant
} from '../controllers/tenantsController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getTenants)
  .post(createTenant);

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
router.patch('/:id/archive', async (req: any, res) => {
  try {
    await cascadeTenantChanges(req.params.id, 'archive', req.user.organizationId);
    const Tenant = require('../models/Tenant').default;
    await Tenant.findByIdAndUpdate(req.params.id, { status: 'Archived' });
    res.status(200).json({ success: true, message: 'Tenant and related data archived' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to archive tenant' });
  }
});

export default router;
