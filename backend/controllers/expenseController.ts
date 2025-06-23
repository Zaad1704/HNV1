import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense';
import Property from '../models/Property';
import { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; 
import { Types } from 'mongoose'; // Import Types for ObjectId

/**
 * @desc    Get all expenses for an organization, with optional filters
 * @route   GET /api/expenses
 * @access  Private
 */
export const getExpenses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
  if (!req.user || !req.user.organizationId) {
    res.status(401);
    throw new Error('User not authorized');
  }
  
  const { propertyId, agentId, startDate, endDate } = req.query;
  const query: any = { organizationId: req.user.organizationId };

  if (propertyId) {
    query.propertyId = propertyId;
  }
  if (agentId) {
    query.paidToAgentId = agentId;
  }
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
  }

  const expenses = await Expense.find(query)
    .populate('propertyId', 'name')
    .populate('paidToAgentId', 'name')
    .sort({ date: -1 });

  res.status(200).json({ success: true, data: expenses });
});

/**
 * @desc    Create a new expense record
 * @route   POST /api/expenses
 * @access  Private
 */
export const createExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
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

  // Fix TS2367 (role mismatch) and TS2339 (property doesn't exist)
  if (category === 'Salary' && paidToAgentId) {
    const isManaged = req.user.managedAgentIds?.some((id: Types.ObjectId) => id.equals(paidToAgentId)); // Fix TS7006 (implicit any) by typing 'id'
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
    documentUrl: req.file ? (req.file as any).imageUrl : undefined
  });

  res.status(201).json({ success: true, data: newExpense });
});

/**
 * @desc    Get a single expense by its ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
export const getExpenseById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Fix TS2367: Ensure role casing matches AuthenticatedUser definition
    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
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
export const updateExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Fix TS2367: Ensure role casing matches AuthenticatedUser definition
    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to update this expense');
    }
    
    const updates = { ...req.body };
    if (req.file) {
        updates.documentUrl = (req.file as any).imageUrl;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, updates, {
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
export const deleteExpense = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Fix TS2367: Ensure role casing matches AuthenticatedUser definition
    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to delete this expense');
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
