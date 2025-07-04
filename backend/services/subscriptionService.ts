import { Subscription } from '../models/Subscription';
import { User } from '../models/User';

class SubscriptionService {
  async createSubscription(userId: string, planId: string) {
    try {
      const subscription = new Subscription({
        userId,
        planId,
        status: 'active',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await subscription.save();
      return subscription;
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: string) {
    try {
      const subscription = await Subscription.findOne({ userId }).populate('planId');
      return subscription;
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      return null;
    }
  }

  async checkSubscriptionStatus(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return { active: false, trial: false };
      }

      const now = new Date();
      const isActive = subscription.status === 'active' && subscription.nextBillingDate > now;
      
      return {
        active: isActive,
        trial: subscription.status === 'trial',
        subscription
      };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return { active: false, trial: false };
    }
  }
}

export default new SubscriptionService();