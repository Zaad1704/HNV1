// backend/controllers/expenseController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense';
import Property from '../models/Property';
import { IUser } from '../models/User';

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }
  
  const query = (req.user.role === 'Super Admin' || !req.user.organizationId)
    ? {} 
    : { organizationId: req.user.organizationId };

  const expenses = await Expense.find(query)
    .populate('propertyId', 'name')
    .populate('paidToAgentId', 'name')
    .sort({ date: -1 });

  res.status(200).json({ success: true, data: expenses });
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.organizationId) {
    res.status(401);
    throw new Error('User not authorized or not part of an organization');
  }

  const { description, amount, category, date, propertyId, paidToAgentId } = req.body;

  if (!description || !amount || !category || !date || !propertyId) {
    res.status(400);
    throw new Error('Please provide all required fields: description, amount, category, date, propertyId');
  }
  
  const property = await Property.findById(propertyId);
  if (!property || !property.organizationId.equals(req.user.organizationId)) {
    res.status(403);
    throw new Error('You do not have permission to assign expenses to this property.');
  }

  if (category === 'Salary' && paidToAgentId) {
    const isManaged = req.user.managedAgentIds?.some(id => id.equals(paidToAgentId));
    if (!isManaged) {
        res.status(403);
        throw new Error('You can only pay salaries to agents you manage.');
    }
  }

  const newExpense = await Expense.create({
    description,
    amount: Number(amount),
    category,
    date,
    propertyId,
    paidToAgentId: paidToAgentId || null,
    organizationId: req.user.organizationId,
    documentUrl: req.file ? `/${req.file.path}` : undefined
  });

  res.status(201).json({ success: true, data: newExpense });
});

export const getExpenseById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to access this expense');
    }

    res.status(200).json({ success: true, data: expense });
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to update this expense');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: updatedExpense });
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to delete this expense');
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
