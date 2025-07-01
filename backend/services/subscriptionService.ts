import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import User from '../models/User';
import Organization from '../models/Organization';
import { addDays, addMonths, addYears } from 'date-fns';

class SubscriptionService {
  async createTrialSubscription(organizationId: string): Promise<any> {
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
      throw new Error('Trial plan not found');
    }

    const trialEndDate = addDays(new Date(), 14); // 14-day trial

    const subscription = new Subscription({
      organizationId,
      planId: trialPlan._id,
      status: 'trialing',
      trialExpiresAt: trialEndDate,
      currentPeriodEndsAt: trialEndDate
    });

    await subscription.save();
    return subscription;
  }

  async upgradePlan(organizationId: string, planId: string, paymentMethodId?: string): Promise<any> {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    let subscription = await Subscription.findOne({ organizationId });
    
    if (!subscription) {
      subscription = new Subscription({ organizationId, planId });
    } else {
      subscription.planId = plan._id;
    }

    // Calculate next billing date
    const now = new Date();
    let nextBillingDate: Date;

    switch (plan.duration) {
      case 'monthly':
        nextBillingDate = addMonths(now, 1);
        break;
      case 'yearly':
        nextBillingDate = addYears(now, 1);
        break;
      default:
        nextBillingDate = addMonths(now, 1);
    }

    subscription.status = 'active';
    subscription.currentPeriodEndsAt = nextBillingDate;
    subscription.trialExpiresAt = undefined;

    await subscription.save();
    return subscription;
  }

  async cancelSubscription(organizationId: string): Promise<void> {
    const subscription = await Subscription.findOne({ organizationId });
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    subscription.status = 'canceled';
    await subscription.save();

    // Update organization status
    await Organization.findByIdAndUpdate(organizationId, {
      status: 'inactive'
    });
  }

  async reactivateSubscription(organizationId: string, planId: string): Promise<any> {
    return this.upgradePlan(organizationId, planId);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await Subscription.find({
      status: { $in: ['trialing', 'active'] },
      $or: [
        { trialExpiresAt: { $lt: new Date() } },
        { currentPeriodEndsAt: { $lt: new Date() } }
      ]
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'inactive';
      await subscription.save();

      // Update organization status
      await Organization.findByIdAndUpdate(subscription.organizationId, {
        status: 'inactive'
      });

      // Suspend users
      await User.updateMany(
        { organizationId: subscription.organizationId },
        { status: 'suspended' }
      );
    }
  }

  async getUsageStats(organizationId: string): Promise<any> {
    const Property = require('../models/Property');
    const Tenant = require('../models/Tenant');
    const User = require('../models/User');

    const [propertiesCount, tenantsCount, agentsCount] = await Promise.all([
      Property.countDocuments({ organizationId }),
      Tenant.countDocuments({ organizationId }),
      User.countDocuments({ organizationId, role: 'Agent' })
    ]);

    const subscription = await Subscription.findOne({ organizationId }).populate('planId') as any;
    const limits = subscription?.planId?.limits || {};

    return {
      usage: {
        properties: propertiesCount,
        tenants: tenantsCount,
        agents: agentsCount
      },
      limits: {
        properties: limits.maxProperties || 0,
        tenants: limits.maxTenants || 0,
        agents: limits.maxAgents || 0
      },
      subscription: {
        status: subscription?.status,
        plan: subscription?.planId?.name,
        expiresAt: subscription?.currentPeriodEndsAt || subscription?.trialExpiresAt
      }
    };
  }

  async processPayment(organizationId: string, planId: string, paymentData: any): Promise<any> {
    // Integration with Stripe or other payment processor
    // For now, simulate successful payment
    
    const subscription = await this.upgradePlan(organizationId, planId);
    
    // Reactivate organization and users
    await Organization.findByIdAndUpdate(organizationId, {
      status: 'active'
    });

    await User.updateMany(
      { organizationId },
      { status: 'active' }
    );

    return {
      success: true,
      subscription,
      message: 'Payment processed successfully'
    };
  }
}

export default new SubscriptionService();