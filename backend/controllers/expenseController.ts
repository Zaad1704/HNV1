// backend/controllers/expenseController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense';
import Property from '../models/Property';
import { IUser } from '../models/User';

/**
 * @desc    Get all expenses for the user's organization (or all for Super Admin)
 * @route   GET /api/expenses
 * @access  Private
 */
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // If user is Super Admin, the query is empty to fetch all documents.
  // Otherwise, it filters by the user's specific organizationId.
  const query = req.user.role === 'Super Admin' 
    ? {} 
    : { organizationId: req.user.organizationId };

  const expenses = await Expense.find(query)
    .populate('propertyId', 'name')
    .populate('paidToAgentId', 'name')
    .sort({ date: -1 });

  res.status(200).json({ success: true, data: expenses });
});

/**
 * @desc    Create a new expense
 * @route   POST /api/expenses
 * @access  Private
 */
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { description, amount, category, date, propertyId, paidToAgentId } = req.body;

  if (!description || !amount || !category || !date || !propertyId) {
    res.status(400);
    throw new Error('Please provide all required fields: description, amount, category, date, propertyId');
  }

  // Verify the property being assigned belongs to the user's organization
  const property = await Property.findById(propertyId);
  if (!property || !property.organizationId.equals(req.user.organizationId)) {
    res.status(403);
    throw new Error('You do not have permission to assign expenses to this property.');
  }

  // If it's a salary, optionally verify the agent is managed by the user (if applicable)
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
    documentUrl: req.file ? `/${req.file.path}` : undefined // Use relative path for the URL
  });

  res.status(201).json({ success: true, data: newExpense });
});

/**
 * @desc    Get a single expense by its ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
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

    // Security check: Ensure the user can only access expenses in their organization (unless Super Admin)
    if (req.user.role !== 'Super Admin' && !expense.organizationId.equals(req.user.organizationId)) {
        res.status(403);
        throw new Error('Not authorized to access this expense');
    }

    res.status(200).json({ success: true, data: expense });
});


/**
 * @desc    Update an existing expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
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

    // Security check
    if (req.user.role !== 'Super Admin' && !expense.organizationId.equals(req.user.organizationId)) {
        res.status(403);
        throw new Error('Not authorized to update this expense');
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: updatedExpense });
});


/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private
 */
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

    // Security check
    if (req.user.role !== 'Super Admin' && !expense.organizationId.equals(req.user.organizationId)) {
        res.status(403);
        throw new Error('Not authorized to delete this expense');
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
