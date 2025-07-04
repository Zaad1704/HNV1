import cron from 'node-cron';
import subscriptionService from '../services/subscriptionService';

// Run every day at midnight to check for expired subscriptions
export const startSubscriptionCron = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running subscription expiry check...');
      const expiredCount = await subscriptionService.checkExpiredSubscriptions();
      console.log(`Updated ${expiredCount} expired subscriptions`);
    } catch (error) {
      console.error('Error in subscription cron job:', error);
    }
  });
  
  console.log('Subscription cron job started');
};