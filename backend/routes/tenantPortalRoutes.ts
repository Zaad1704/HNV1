import { Router } from 'express';
import {
  getDashboard,
  getMaintenanceRequests,
  createMaintenanceRequest,
  getPayments,
  createPayment,
  getPortal,
  getStatement,
  getStatementPdf
} from '../controllers/tenantPortalController';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/maintenance', getMaintenanceRequests);
router.post('/maintenance', createMaintenanceRequest);
router.get('/payments', getPayments);
router.post('/payment', createPayment);
router.get('/portal', getPortal);
router.get('/statement/:tenantId', getStatement);
router.get('/statement/:tenantId/pdf', getStatementPdf);

export default router;