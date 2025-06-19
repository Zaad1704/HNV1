import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense';
import Property from '../models/Property';
// No need to import IUser here, as it's handled by the global request type

/**
 * @desc    Get all expenses for the user's organization
 * @route   GET /api/expenses
 * @access  Private
 */
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  // With global types, req.user is already correctly typed as IUser | undefined.
  // We just need to check if it exists. No "as IUser" needed.
  if (!req.user) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const expenses = await Expense.find({ organizationId: req.user.organizationId })
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
    throw new Error('Please provide all required fields');
  }

  // Verify property belongs to the user's organization
  const property = await Property.findById(propertyId);
  if (!property || !property.organizationId.equals(req.user.organizationId)) {
    res.status(403);
    throw new Error('Invalid property selected');
  }

  // Verify agent belongs to the landlord (if it's a salary payment)
  if (category === 'Salary' && paidToAgentId) {
    // Optional chaining on managedAgentIds is good practice
    if (!req.user.managedAgentIds?.some(id => id.equals(paidToAgentId))) {
      res.status(403);
      throw new Error('This agent is not managed by you');
    }
  }

  const newExpense = await Expense.create({
    description,
    amount,
    category,
    date,
    propertyId,
    paidToAgentId,
    organizationId: req.user.organizationId,
    ...(req.file && { documentUrl: req.file.path }) // Using req.file.path is often more reliable
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

    const expense = await Expense.findById(req.params.id)
      .populate('propertyId', 'name')
      .populate('paidToAgentId', 'name');

    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');
    }

    // Security check: Ensure the requested expense belongs to the user's organization
    if (!expense.organizationId.equals(req.user.organizationId)) {
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
    if (!expense.organizationId.equals(req.user.organizationId)) {
        res.status(403);
        throw new Error('Not authorized to update this expense');
    }

    // If propertyId is being updated, re-validate it
    if (req.body.propertyId) {
        const property = await Property.findById(req.body.propertyId);
        if (!property || !property.organizationId.equals(req.user.organizationId)) {
            res.status(403);
            throw new Error('Invalid property selected');
        }
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
    if (!expense.organizationId.equals(req.user.organizationId)) {
        res.status(403);
        throw new Error('Not authorized to delete this expense');
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
