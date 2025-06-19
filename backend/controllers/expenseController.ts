import { Request, Response } from 'express'; // FIX: Import Request
// FIX: AuthenticatedRequest is no longer needed.
import Expense from '../models/Expense';
import Property from '../models/Property';
import User from '../models/User';

// @desc    Get all expenses for the user's organization
// @route   GET /api/expenses
export const getExpenses = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const expenses = await Expense.find({ organizationId: req.user.organizationId })
            .populate('propertyId', 'name')
            .populate('paidToAgentId', 'name') // Populate agent name for salary payments
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new expense (with optional document)
// @route   POST /api/expenses
export const createExpense = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { description, amount, category, date, propertyId, paidToAgentId } = req.body;

    if (!description || !amount || !category || !date || !propertyId) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        // Verify the property belongs to the user's organization
        const property = await Property.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Invalid property selected.' });
        }
        
        // If it's a salary, verify the agent belongs to the landlord
        if (category === 'Salary' && paidToAgentId) {
             const isManaged = req.user.managedAgentIds.includes(paidToAgentId);
             if (!isManaged) {
                 return res.status(403).json({ success: false, message: 'This agent is not managed by you.'})
             }
        }

        const newExpenseData: any = {
            ...req.body,
            organizationId: req.user.organizationId,
        };

        // If a file was uploaded, add its URL to the data
        if (req.file) {
            // The URL path will depend on how you serve static files
            const documentUrl = `/uploads/${req.file.filename}`;
            newExpenseData.documentUrl = documentUrl;
        }

        const newExpense = await Expense.create(newExpenseData);

        res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
