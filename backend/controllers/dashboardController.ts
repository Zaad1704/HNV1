import { Response } from 'express';
import Lease from '../models/Lease'; // Assuming you have a Lease model
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Other dashboard controller functions ...

export const getExpiringLeases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    // Example: find leases expiring within next 30 days in the user's organization
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const expiringLeases = await Lease.find({
      organizationId: req.user.organizationId,
      endDate: { $gte: now, $lte: in30Days }
    })
      .populate('propertyId', 'name address')
      .populate('tenantId', 'name email')
      .sort({ endDate: 1 });

    res.status(200).json({ success: true, count: expiringLeases.length, data: expiringLeases });
  } catch (error: any) {
    console.error('Error fetching expiring leases:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
