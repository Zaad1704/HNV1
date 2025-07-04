import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import Organization from '../models/Organization';
import { addMonths, addYears, addWeeks, addDays } from 'date-fns';

class SubscriptionService {
  async createSubscription(organizationId: string, planId: string): Promise<any> {
    try {
      const plan = await Plan.findById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }



      let currentPeriodEndsAt: Date;
      const now = new Date();

      switch (plan.duration) {
        case 'daily':
          currentPeriodEndsAt = addDays(now, 1);
          break;
        case 'weekly':
          currentPeriodEndsAt = addWeeks(now, 1);
          break;
        case 'monthly':
          currentPeriodEndsAt = addMonths(now, 1);
          break;
        case 'yearly':
          currentPeriodEndsAt = addYears(now, 1);
          break;
        default:
          currentPeriodEndsAt = addMonths(now, 1);
      }


      const subscription = await Subscription.create({
        organizationId,
        planId: plan._id,
        status: 'active',
        currentPeriodEndsAt,
        isLifetime: false
      });

      organization.subscription = subscription._id;
      await organization.save();

      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  }



  async updateSubscription(subscriptionId: string, updates: any): Promise<any> {
    try {
      const subscription = await Subscription.findByIdAndUpdate(
        subscriptionId,
        updates,
        { new: true }
      ).populate('planId');

      return subscription;
    } catch (error) {
      console.error('Subscription update failed:', error);
      throw error;
    }
  }



  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const subscription = await Subscription.findByIdAndUpdate(
        subscriptionId,
        {
          status: 'canceled',
          canceledAt: new Date()
        },
        { new: true }
      );

      return subscription;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      throw error;
    }
  }



  async getSubscriptionByOrganization(organizationId: string): Promise<any> {
    try {
      const subscription = await Subscription.findOne({ organizationId })
        .populate('planId')
        .populate('organizationId', 'name');

      return subscription;
    } catch (error) {
      console.error('Get subscription failed:', error);
      throw error;
    }
  }



  async checkSubscriptionStatus(organizationId: string): Promise<boolean> {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      
      if (!subscription) {
        return false;
      }

      if (subscription.isLifetime) {
        return true;
      }

      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return false;
      }

      if (subscription.currentPeriodEndsAt && new Date() > subscription.currentPeriodEndsAt) {
        await Subscription.findByIdAndUpdate(subscription._id, {
          status: 'expired',
          expiredAt: new Date()
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Subscription status check failed:', error);
      return false;
    }
  }
}

export default new SubscriptionService();