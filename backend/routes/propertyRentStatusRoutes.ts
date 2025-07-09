import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';

const router = Router();

router.use(protect);

// Get rent status overview for a property by year
router.get('/:propertyId/rent-status/:year', async (req: any, res) => {
  try {
    const { propertyId, year } = req.params;
    
    // Get all payments for the property in the specified year
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    const payments = await Payment.find({
      propertyId,
      organizationId: req.user.organizationId,
      paymentDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['Paid', 'completed'] }
    }).populate('tenantId', 'name unit');

    // Get all active tenants for the property
    const tenants = await Tenant.find({
      propertyId,
      organizationId: req.user.organizationId,
      status: 'Active'
    });

    // Calculate monthly breakdown
    const months = Array.from({ length: 12 }, (_, i) => ({
      paid: 0,
      due: 0,
      paidTenants: [],
      dueTenants: []
    }));

    let totalPaid = 0;
    let paidCount = 0;

    // Process payments
    payments.forEach(payment => {
      const month = new Date(payment.paymentDate).getMonth();
      months[month].paid += payment.amount;
      totalPaid += payment.amount;
      paidCount++;
    });

    // Calculate dues (simplified - assumes monthly rent)
    let totalDue = 0;
    let dueCount = 0;

    tenants.forEach(tenant => {
      for (let month = 0; month < 12; month++) {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const hasPaid = payments.some(p => 
          p.tenantId._id.toString() === tenant._id.toString() &&
          p.rentMonth === monthKey
        );
        
        if (!hasPaid) {
          months[month].due += tenant.rentAmount || 0;
          totalDue += tenant.rentAmount || 0;
          dueCount++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalPaid,
        totalDue,
        paidCount,
        dueCount,
        months
      }
    });
  } catch (error) {
    console.error('Rent status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get detailed rent information for a specific month
router.get('/:propertyId/rent-details/:month', async (req: any, res) => {
  try {
    const { propertyId, month } = req.params; // month format: YYYY-MM
    
    // Get payments for the specific month
    const payments = await Payment.find({
      propertyId,
      organizationId: req.user.organizationId,
      rentMonth: month,
      status: { $in: ['Paid', 'completed'] }
    }).populate('tenantId', 'name unit rentAmount');

    // Get all active tenants
    const allTenants = await Tenant.find({
      propertyId,
      organizationId: req.user.organizationId,
      status: 'Active'
    });

    // Find tenants who haven't paid
    const paidTenantIds = payments.map(p => p.tenantId._id.toString());
    const dueTenants = allTenants.filter(tenant => 
      !paidTenantIds.includes(tenant._id.toString())
    );

    res.status(200).json({
      success: true,
      data: {
        paid: payments,
        due: dueTenants,
        totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
        totalDue: dueTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
      }
    });
  } catch (error) {
    console.error('Rent details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;