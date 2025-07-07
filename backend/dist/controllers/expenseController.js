"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const Expense_1 = __importDefault(require("../models/Expense"));
const Property_1 = __importDefault(require("../models/Property"));
const getExpenses = async (req, res) => {
    try {
        if (!req.user?.organizationId && req.user?.role !== 'Super Admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const query = req.user.role === 'Super Admin' && !req.user.organizationId
            ? {}
            : { organizationId: req.user.organizationId };
        const expenses = await Expense_1.default.find(query)
            .populate('propertyId', 'name')
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { description, amount, category, date, propertyId } = req.body;
        if (!description || !amount || !category) {
            return res.status(400).json({
                success: false,
                message: 'Description, amount, and category are required'
            });
        }
        if (propertyId) {
            const property = await Property_1.default.findById(propertyId);
            if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid property'
                });
            }
        }
        const newExpense = await Expense_1.default.create({
            description,
            amount: Number(amount),
            category,
            date: date ? new Date(date) : new Date(),
            propertyId: propertyId || null,
            organizationId: req.user.organizationId,
            documentUrl: req.body.documentUrl || null
        });
        res.status(201).json({ success: true, data: newExpense });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const expense = await Expense_1.default.findById(req.params.id);
        if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        const updatedExpense = await Expense_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedExpense });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const expense = await Expense_1.default.findById(req.params.id);
        if (!expense || expense.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        await expense.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteExpense = deleteExpense;
