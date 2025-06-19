import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac
import AuditLog from '../models/AuditLog';

const router = Router();

// Protect all routes in this file and require Super Admin or Landlord role
router.use(protect, authorize(['Super Admin', 'Landlord']));

// @desc    Get all audit logs for the user's organization (or all for Super Admin)
// @route   GET /api/audit
// @access  Private (Super Admin, Landlord)
router.get('/', async (req, res) => {
    try {
        let query: any = {};
        // If user is not Super Admin, filter logs by their organization
        if (req.user?.role !== 'Super Admin') {
            query.organizationId = req.user?.organizationId;
        }
        const logs = await AuditLog.find(query)
                                   .populate('user', 'name email') // Populate user info
                                   .sort({ timestamp: -1 })
                                   .limit(100); // Limit results for performance

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
