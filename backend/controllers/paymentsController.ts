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
    // Find all payments that belong to the logged-in user's organization
    // Populate related data for a comprehensive view on the frontend
    const payments = await Payment.find({ organizationId: req.user!.organizationId })
      .populate('tenantId', 'name')      // Get the tenant's name
      .populate('propertyId', 'name')    // Get the property's name
      .populate('recordedBy', 'name')    // Get the name of the user who recorded it
      .sort({ paymentDate: -1 });      // Show most recent payments first

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// In a future update, a developer would add functions here for creating,
// viewing, and managing individual payment records. For example:

/*
export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  // Logic to manually record a new payment
};

export const getPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  // Logic to get a single payment record
};
*/
