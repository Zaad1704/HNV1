import Stripe from 'stripe';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import Integration from '../models/Integration';

class PaymentService {
  private stripe: Stripe | null = null;

  async initializeStripe(organizationId?: string): Promise<void> {
    // Use global Stripe key if no organization specified
    if (!organizationId && process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-05-28.basil'
      });
      return;
    }

    if (organizationId) {
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
  }

  async createPaymentIntent(data: {
    organizationId: string;
    tenantId?: string;
    amount: number;
    currency: string;
    description: string;
    planId?: string;
  }): Promise<any> {
    await this.initializeStripe(data.organizationId);
    
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    let customer;
    if (data.tenantId) {
      const tenant = await Tenant.findById(data.tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      customer = tenant.stripeCustomerId;
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency.toLowerCase(),
      description: data.description,
      customer: customer,
      metadata: {
        organizationId: data.organizationId,
        tenantId: data.tenantId || '',
        planId: data.planId || '',
        type: data.planId ? 'subscription' : 'rent'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = new Payment({
      organizationId: data.organizationId,
      tenantId: data.tenantId,
      propertyId: data.tenantId ? (await Tenant.findById(data.tenantId))?.propertyId : undefined,
      amount: data.amount,
      paymentMethod: 'card',
      status: 'Pending',
      stripePaymentIntentId: paymentIntent.id,
      description: data.description
    });

    await payment.save();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    };
  }

  async createSubscriptionCheckout(data: {
    organizationId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<any> {
    await this.initializeStripe();
    
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const Plan = require('../models/Plan');
    const plan = await Plan.findById(data.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.features.join(', '),
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.duration === 'yearly' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        organizationId: data.organizationId,
        planId: data.planId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    await this.initializeStripe();
    
    if (!this.stripe) return;

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) return;

    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
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
      case 'checkout.session.completed':
        await this.handleCheckoutSuccess(event.data.object);
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

      // If this is a subscription payment, update subscription
      if (paymentIntent.metadata.planId) {
        const subscriptionService = require('./subscriptionService').default;
        await subscriptionService.upgradePlan(
          paymentIntent.metadata.organizationId,
          paymentIntent.metadata.planId
        );
      }
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

  private async handleCheckoutSuccess(session: any): Promise<void> {
    if (session.metadata.organizationId && session.metadata.planId) {
      const subscriptionService = require('./subscriptionService').default;
      await subscriptionService.upgradePlan(
        session.metadata.organizationId,
        session.metadata.planId
      );
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