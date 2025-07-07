import { Router } from 'express';
import {
  getDashboard,
  getMaintenanceRequests,
  createMaintenanceRequest,
  getPayments,
  createPayment,
  getPortal,
  getStatement,
  getStatementPdf,
  getTenantDashboard
} from '../controllers/tenantPortalController';

const router = Router();

router.get('/dashboard', getTenantDashboard);
router.get('/dashboard-old', getDashboard);
router.get('/maintenance', getMaintenanceRequests);
router.post('/maintenance', createMaintenanceRequest);
router.get('/payments', getPayments);
router.post('/payment', createPayment);
router.get('/portal', getPortal);
router.get('/statement/:tenantId', getStatement);
router.get('/statement/:tenantId/pdf', getStatementPdf);

export default router;