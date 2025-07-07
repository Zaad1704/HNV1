import Subscription from '../models/Subscription';
import Organization from '../models/Organization';
import Plan from '../models/Plan';

class SubscriptionService {
  async createTrialSubscription(organizationId: string, planId?: string) {
    try {
      // Use provided plan or find default trial plan
      let plan;
      if (planId) {
        plan = await Plan.findById(planId);
      } else {
        // Find the default trial plan (lowest price active plan)
        plan = await Plan.findOne({ 
          isActive: true, 
          isPublic: true 
        }).sort({ price: 1 });
      }
      
      if (!plan) throw new Error('No trial plan available');

      const trialDays = plan.trialDays || 14;
      const trialExpiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

      const subscription = await Subscription.create({
        organizationId,
        planId: plan._id,
        status: 'trialing',
        trialExpiresAt,
        currentPeriodEndsAt: trialExpiresAt,
        amount: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        maxProperties: plan.maxProperties,
        maxTenants: plan.maxTenants,
        maxUsers: plan.maxUsers,
        maxAgents: plan.maxAgents
      });

      return subscription;
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      throw error;
    }
  }

  async activateSubscription(organizationId: string, planId: string) {
    try {
      const plan = await Plan.findById(planId);
      if (!plan) throw new Error('Plan not found');

      const currentPeriodEndsAt = new Date();
      if (plan.interval === 'monthly') {
        currentPeriodEndsAt.setMonth(currentPeriodEndsAt.getMonth() + 1);
      } else if (plan.interval === 'yearly') {
        currentPeriodEndsAt.setFullYear(currentPeriodEndsAt.getFullYear() + 1);
      }

      let subscription = await Subscription.findOne({ organizationId });
      
      if (subscription) {
        subscription.planId = planId as any;
        subscription.status = 'active';
        subscription.currentPeriodEndsAt = currentPeriodEndsAt;
        await subscription.save();
      } else {
        subscription = await Subscription.create({
          organizationId,
          planId,
          status: 'active',
          currentPeriodEndsAt
        });
      }

      return subscription;
    } catch (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(organizationId: string) {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      if (!subscription) throw new Error('Subscription not found');

      subscription.status = 'canceled';
      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(organizationId: string) {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      if (!subscription) throw new Error('Subscription not found');

      const plan = await Plan.findById(subscription.planId);
      if (!plan) throw new Error('Plan not found');

      const currentPeriodEndsAt = new Date();
      if (plan.interval === 'monthly') {
        currentPeriodEndsAt.setMonth(currentPeriodEndsAt.getMonth() + 1);
      } else if (plan.interval === 'yearly') {
        currentPeriodEndsAt.setFullYear(currentPeriodEndsAt.getFullYear() + 1);
      }

      subscription.status = 'active';
      subscription.currentPeriodEndsAt = currentPeriodEndsAt;
      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await Subscription.find({
        status: { $in: ['active', 'trialing'] },
        currentPeriodEndsAt: { $lt: new Date() }
      });

      for (const subscription of expiredSubscriptions) {
        subscription.status = 'past_due';
        await subscription.save();
      }

      return expiredSubscriptions.length;
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(organizationId: string) {
    try {
      const subscription = await Subscription.findOne({ organizationId })
        .populate('planId');

      if (!subscription) {
        return { hasSubscription: false, status: null };
      }

      const isExpired = subscription.currentPeriodEndsAt && 
        subscription.currentPeriodEndsAt < new Date();

      return {
        hasSubscription: true,
        status: subscription.status,
        isExpired,
        plan: subscription.planId,
        expiresAt: subscription.currentPeriodEndsAt,
        isLifetime: subscription.isLifetime
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();