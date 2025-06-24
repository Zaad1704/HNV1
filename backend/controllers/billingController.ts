import { Request, Response } from 'express';
import Plan, { IPlan } from '../models/Plan';
import Tenant from '../models/Tenant';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';

export const getSubscriptionDetails = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'User not authenticated.' });
        return;
    }
    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId })
            .populate('planId');
        // FIX: If no subscription is found, return a successful response with null data
        // This allows the frontend to handle the 'no subscription' state gracefully
        if (!subscription) {
            res.status(200).json({ success: true, data: null });
            return;
        }
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
    const { planId } = req.body;
    const user = req.user;
    if (!user) {
        res.status(401).json({ success: false, message: 'User not authenticated.' });
        return;
    }
    try {
        const plan = await Plan.findById(planId);
        if (!plan) {
            res.status(404).json({ success: false, message: 'Plan not found.' });
            return;
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

export const createRentPaymentSession = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated.' });
      return;
    }
    const { invoiceId, lineItems } = req.body; 

    if (!invoiceId) {
        res.status(400).json({ success: false, message: 'Invoice ID is required for rent payment.' });
        return;
    }

    try {
        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) {
          res.status(404).json({ success: false, message: 'Tenant profile not found.' });
          return;
        }

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice || invoice.tenantId.toString() !== tenant._id.toString()) {
            res.status(404).json({ success: false, message: 'Invoice not found or does not belong to this tenant.' });
            return;
        }
        if (invoice.status === 'paid') {
            res.status(400).json({ success: false, message: 'This invoice has already been paid.' });
            return;
        }

        const paymentAmount = invoice.amount;
        const paymentItems = lineItems && lineItems.length > 0 
            ? lineItems.map((item: { description: string; amount: number; }) => ({
                Name: item.description,
                Price: { Amount: item.amount.toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0'
            }))
            : invoice.lineItems.map(item => ({
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
            CustomerReference: invoiceId,
        };

        console.log("Simulating 2Checkout rent payment API call with payload:", JSON.stringify(payload, null, 2));
        
        const mockSuccess = Math.random() > 0.1;

        if (mockSuccess) {
            invoice.status = 'paid';
            invoice.paidAt = new Date();
            invoice.transactionId = mockTransactionId;
            await invoice.save();

            await Payment.create({
                tenantId: invoice.tenantId,
                propertyId: invoice.propertyId,
                organizationId: invoice.organizationId,
                recordedBy: user._id,
                amount: invoice.amount,
                paymentDate: new Date(),
                status: 'Paid',
                transactionId: mockTransactionId,
                lineItems: invoice.lineItems,
                paidForMonth: invoice.dueDate,
            });

            const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?invoiceId=${invoice._id}&transactionId=${mockTransactionId}`;
            res.status(200).json({ success: true, redirectUrl: redirectUrl });
        } else {
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
    res.status(200).send('Webhook processed');
};
