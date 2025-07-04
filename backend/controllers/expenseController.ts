import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expenses = await Expense.find({ 
      organizationId: req.user.organizationId 
    }).populate('propertyId', 'name').sort({ date: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { description, amount, category, date, propertyId } = req.body;

    if (!description || !amount || !category || !date || !propertyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid property' 
      });
    }

    const newExpense = await Expense.create({
      description,
      amount: Number(amount),
      category,
      date,
      propertyId,
      organizationId: req.user.organizationId
    });

    res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};