import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';

export const checkSubscriptionStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return next();
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    });

    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    next();
  }
};
