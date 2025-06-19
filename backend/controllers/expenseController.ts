// controllers/expenseController.ts
import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Property from '../models/Property';
import { IUser } from '../models/User';

export const createExpense = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) return res.status(401).json({ message: 'Not authorized' });

  const { description, amount, category, date, propertyId, paidToAgentId } = req.body;

  try {
    // Add null checks for managedAgentIds
    if (category === 'Salary' && paidToAgentId) {
      if (!user.managedAgentIds?.includes(paidToAgentId)) {
        return res.status(403).json({ message: 'This agent is not managed by you' });
      }
    }

    // ... rest of your existing code
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
