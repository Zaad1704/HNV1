import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Expense from '../models/Expense';
import Property from '../models/Property';

// @desc    Get all expenses for the user's organization
// @route   GET /api/expenses
export const getExpenses = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const expenses = await Expense.find({ organizationId: req.user.organizationId })
            .populate('propertyId', 'name')
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new expense
// @route   POST /api/expenses
export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { description, amount, category, date, propertyId } = req.body;

    if (!description || !amount || !category || !date || !propertyId) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        // Verify the property belongs to the user's organization
        const property = await Property.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Invalid property selected.' });
        }

        const newExpense = await Expense.create({
            ...req.body,
            organizationId: req.user.organizationId,
        });

        res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
