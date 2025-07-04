import { Request, Response } from 'express';
import Plan from '../models/Plan';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
};