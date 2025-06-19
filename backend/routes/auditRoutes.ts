import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import AuditLog from '../models/AuditLog';

const router = Router();

router.use(protect, authorize(['Super Admin', 'Landlord']));

router.get('/', async (req, res) => {
    try {
        let query: any = {};
        
        // With the corrected global types, these accesses are now valid.
        if (req.user?.role !== 'Super Admin') {
            query.organizationId = req.user?.organizationId;
        }
        const logs = await AuditLog.find(query)
                                   .populate('user', 'name email')
                                   .sort({ timestamp: -1 })
                                   .limit(100);

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
