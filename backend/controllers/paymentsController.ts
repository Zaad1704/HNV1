import { Response } from 'express';
import Payment from '../models/Payment';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * @desc    Get all payment records for the user's organization
 * @route   GET /api/payments
 * @access  Private
 */
export const getPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // FIX: Added a check to ensure req.user exists before using it.
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const payments = await Payment.find({ organizationId: req.user.organizationId })
      .populate('tenantId', 'name')
      .populate('propertyId', 'name')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
