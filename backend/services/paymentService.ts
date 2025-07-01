import Stripe from 'stripe';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import Integration from '../models/Integration';

class PaymentService {
  private stripe: Stripe | null = null;

  async initializeStripe(organizationId: string): Promise<void> {
    const integration = await Integration.findOne({
      organizationId,
      provider: 'stripe',
      'config.isActive': true
    });

    if (integration?.config.apiKey) {
      this.stripe = new Stripe(integration.config.apiKey, {
        apiVersion: '2025-05-28.basil'
      });
    }
  }

  async createPaymentIntent(data: {
    organizationId: string;
    tenantId: string;
    amount: number;
    currency: string;
    description: string;
  }): Promise<any> {
    await this.initializeStripe(data.organizationId);
    
    if (!this.stripe) {
      throw new Error('Stripe not configured for this organization');
    }

    const tenant = await Tenant.findById(data.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency.toLowerCase(),
      description: data.description,
      metadata: {
        organizationId: data.organizationId,
        tenantId: data.tenantId,
        tenantName: tenant.name
      }
    });

    // Create payment record
    const payment = new Payment({
      organizationId: data.organizationId,
      tenantId: data.tenantId,
      propertyId: tenant.propertyId,
      amount: data.amount,
      paymentMethod: 'card',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      description: data.description
    });

    await payment.save();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    };
  }

  async handleWebhook(organizationId: string, payload: any, signature: string): Promise<void> {
    await this.initializeStripe(organizationId);
    
    if (!this.stripe) return;

    const integration = await Integration.findOne({
      organizationId,
      provider: 'stripe'
    });

    if (!integration?.config.settings?.webhookSecret) return;

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        integration.config.settings.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'Paid';
      payment.paymentDate = new Date();
      payment.transactionId = paymentIntent.id;
      await payment.save();
    }
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    const payment = await Payment.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (payment) {
      payment.status = 'Failed';
      await payment.save();
    }
  }

  async getPaymentMethods(organizationId: string, tenantId: string): Promise<any[]> {
    await this.initializeStripe(organizationId);
    
    if (!this.stripe) return [];

    const tenant = await Tenant.findById(tenantId);
    if (!tenant?.stripeCustomerId) return [];

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: tenant.stripeCustomerId,
      type: 'card'
    });

    return paymentMethods.data;
  }

  async createCustomer(organizationId: string, tenantId: string): Promise<string> {
    await this.initializeStripe(organizationId);
    
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const customer = await this.stripe.customers.create({
      name: tenant.name,
      email: tenant.email,
      metadata: {
        tenantId: tenantId,
        organizationId: organizationId
      }
    });

    tenant.stripeCustomerId = customer.id;
    await tenant.save();

    return customer.id;
  }
}

export default new PaymentService();