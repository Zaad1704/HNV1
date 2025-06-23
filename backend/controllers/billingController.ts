// backend/controllers/billingController.ts

import { Request, Response } from 'express';
import Plan, { IPlan } from '../models/Plan';
import Tenant from '../models/Tenant';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment'; // NEW IMPORT
import Invoice from '../models/Invoice'; // NEW IMPORT
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Re-import AuthenticatedRequest

export const getSubscriptionDetails = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }
    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId })
            .populate('planId');
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found.' });
        }
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
    const { planId } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }
    try {
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found.' });
        }

        const userName = user.name || 'Valued Customer';

        const payload = {
            BillingDetails: {
                FirstName: userName.split(' ')[0],
                LastName: userName.split(' ')[1] || 'User',
                Email: user.email,
            },
            Items: [{
                Name: plan.name,
                Price: { Amount: (plan.price / 100).toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0',
                RecurringOptions: { Enable: '1', Period: plan.duration === 'monthly' ? 'MONTH' : 'YEAR', PeriodLength: '1' }
            }],
            PaymentDetails: { Currency: 'USD', PaymentMethod: { Type: 'CARD', EesToken: null } },
            DevStudio: true,
        };
        console.log("Simulating 2Checkout API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;
        res.status(200).json({ success: true, redirectUrl: redirectUrl });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- MODIFIED FUNCTION ---
// @desc    Create a checkout session for a one-time rent payment (linked to an invoice)
// @route   POST /api/billing/create-rent-payment
export const createRentPaymentSession = async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'User not authenticated.' });

    // NEW: Accept invoiceId and lineItems from the request body
    const { invoiceId, lineItems } = req.body; 

    if (!invoiceId) {
        return res.status(400).json({ success: false, message: 'Invoice ID is required for rent payment.' });
    }

    try {
        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant profile not found.' });

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice || invoice.tenantId.toString() !== tenant._id.toString()) {
            return res.status(404).json({ success: false, message: 'Invoice not found or does not belong to this tenant.' });
        }
        if (invoice.status === 'paid') {
            return res.status(400).json({ success: false, message: 'This invoice has already been paid.' });
        }

        // Use invoice details for 2Checkout payload
        const paymentAmount = invoice.amount;
        const paymentItems = lineItems && lineItems.length > 0 
            ? lineItems.map((item: { description: string; amount: number; }) => ({
                Name: item.description,
                Price: { Amount: item.amount.toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0'
            }))
            : invoice.lineItems.map(item => ({ // Fallback to invoice's line items
                Name: item.description,
                Price: { Amount: item.amount.toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0'
            }));

        const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const payload = {
            BillingDetails: {
                FirstName: tenant.name.split(' ')[0],
                LastName: tenant.name.split(' ')[1] || 'Tenant',
                Email: tenant.email,
            },
            Items: paymentItems,
            PaymentDetails: { Currency: 'USD', PaymentMethod: { Type: 'CARD', EesToken: null } },
            DevStudio: true,
            // Pass invoiceId in metadata so webhook (or success page) can process it
            CustomerReference: invoiceId, // A common field for linking transactions
        };

        console.log("Simulating 2Checkout rent payment API call with payload:", JSON.stringify(payload, null, 2));
        
        // --- Simulate Payment Success/Failure and Update DB ---
        // In a real scenario, this DB update would happen via a webhook AFTER 2Checkout confirms payment.
        // For mock, we'll do it immediately and redirect to success/cancel page based on outcome.
        const mockSuccess = Math.random() > 0.1; // 90% success rate for mock payments

        if (mockSuccess) {
            // Update Invoice status to 'paid'
            invoice.status = 'paid';
            invoice.paidAt = new Date();
            invoice.transactionId = mockTransactionId;
            await invoice.save();

            // Create a Payment record
            await Payment.create({
                tenantId: invoice.tenantId,
                propertyId: invoice.propertyId,
                organizationId: invoice.organizationId,
                recordedBy: user._id, // User is the tenant here
                amount: invoice.amount,
                paymentDate: new Date(),
                status: 'Paid',
                transactionId: mockTransactionId,
                lineItems: invoice.lineItems,
                paidForMonth: invoice.dueDate, // Assuming dueDate is the 1st of the month
            });

            const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?invoiceId=${invoice._id}&transactionId=${mockTransactionId}`;
            res.status(200).json({ success: true, redirectUrl: redirectUrl });
        } else {
            // Simulate payment failure
            const redirectUrl = `${process.env.FRONTEND_URL}/payment-cancel?invoiceId=${invoice._id}`;
            res.status(200).json({ success: false, redirectUrl: redirectUrl, message: 'Mock payment failed.' });
        }

    } catch (error) {
        console.error('Rent payment session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const handlePaymentWebhook = async (req: Request, res: Response) => {
    console.log('Webhook received:', req.body);
    // In a real application, you would verify the webhook signature,
    // process the payment confirmation, update subscription/payment status in your DB.
    // For rent payments, you would typically look for the 'CustomerReference' (invoiceId)
    // to mark the invoice as paid and create the payment record.
    res.status(200).send('Webhook processed');
};
