import { Router } from 'express';
import { generateMonthlyCollectionSheet, getTenantMonthlyStatement } from '../controllers/reportController'; // NEW IMPORT: getTenantMonthlyStatement
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.get('/monthly-collection-sheet', protect, authorize(['Landlord', 'Agent']), generateMonthlyCollectionSheet);

// NEW ROUTE for C.2: Get Tenant Monthly Statement
router.get('/tenant-statement/:tenantId', protect, authorize(['Landlord', 'Agent']), getTenantMonthlyStatement);

export default router;
