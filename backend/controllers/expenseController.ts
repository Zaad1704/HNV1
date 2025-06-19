import { Request, Response } from 'express';
import Expense from '../models/Expense';
import Property from '../models/Property';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

export const getExpenses = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const expenses = await Expense.find({ organizationId: user.organizationId })
      .populate('propertyId', 'name')
      .populate('paidToAgentId', 'name')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const { description, amount, category, date, propertyId, paidToAgentId } = req.body;

  if (!description || !amount || !category || !date || !propertyId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide all required fields' 
    });
  }

  try {
    // Verify property belongs to organization
    const property = await Property.findById(propertyId);
    if (!property || !property.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid property selected' 
      });
    }

    // Verify agent belongs to landlord (if salary payment)
    if (category === 'Salary' && paidToAgentId) {
      if (!user.managedAgentIds?.some(id => id.equals(paidToAgentId))) {
        return res.status(403).json({ 
          success: false, 
          message: 'This agent is not managed by you' 
        });
      }
    }

    const newExpense = await Expense.create({
      description,
      amount,
      category,
      date,
      propertyId,
      paidToAgentId,
      organizationId: user.organizationId,
      ...(req.file && { documentUrl: `/uploads/${req.file.filename}` })
    });

    res.status(201).json({ success: true, data: newExpense });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server Error' 
    });
  }
};

export const getExpenseById = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const expense = await Expense.findById(req.params.id)
      .populate('propertyId', 'name')
      .populate('paidToAgentId', 'name');

    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    if (!expense.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this expense' 
      });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    let expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    if (!expense.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this expense' 
      });
    }

    // Verify property if being updated
    if (req.body.propertyId) {
      const property = await Property.findById(req.body.propertyId);
      if (!property || !property.organizationId.equals(user.organizationId)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid property selected' 
        });
      }
    }

    // Verify agent if being updated for salary payment
    if (req.body.category === 'Salary' && req.body.paidToAgentId) {
      if (!user.managedAgentIds?.some(id => id.equals(req.body.paidToAgentId))) {
        return res.status(403).json({ 
          success: false, 
          message: 'This agent is not managed by you' 
        });
      }
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: expense });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Server Error' 
    });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    if (!expense.organizationId.equals(user.organizationId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this expense' 
      });
    }

    await expense.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
