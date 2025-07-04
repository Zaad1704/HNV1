"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.createExpense = exports.getExpenses = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Expense_1 = __importDefault(require("../models/Expense"));
const Property_1 = __importDefault(require("../models/Property"));
exports.getExpenses = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');

    const { propertyId, agentId, startDate, endDate } = req.query;
    const query = { organizationId: req.user.organizationId };
    if (propertyId) {
        query.propertyId = propertyId;

    if (agentId) {
        query.paidToAgentId = agentId;

    if (startDate && endDate) {
        query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

    const expenses = await Expense_1.default.find(query)
        .populate('propertyId', 'name')
        .populate('paidToAgentId', 'name')
        .sort({ date: -1 });
    res.status(200).json({ success: true, data: expenses });
});
exports.createExpense = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');

    const { description, amount, category, date, propertyId, paidToAgentId } = req.body;
    if (!description || !amount || !category || !date || !propertyId) {
        res.status(400);
        throw new Error('Please provide all required fields: description, amount, category, date, propertyId');

    const property = await Property_1.default.findById(propertyId);
    if (!property || !property.organizationId.equals(req.user.organizationId)) {
        res.status(403);
        throw new Error('You do not have permission to assign expenses to this property.');

    if (category === 'Salary' && paidToAgentId) {
        const isManaged = req.user.managedAgentIds?.some((id) => id.equals(paidToAgentId));
        if (!isManaged) {
            res.status(403);
            throw new Error('You can only pay salaries to agents you manage.');


    const newExpense = await Expense_1.default.create({
        description,
        amount: Number(amount),
        category,
        date,
        propertyId,
        paidToAgentId: paidToAgentId || null,
        organizationId: req.user.organizationId,
        documentUrl: req.file ? req.file.imageUrl : undefined
    });
    res.status(201).json({ success: true, data: newExpense });
});
exports.getExpenseById = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');

    const expense = await Expense_1.default.findById(req.params.id);
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');

    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to access this expense');

    res.status(200).json({ success: true, data: expense });
});
exports.updateExpense = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');

    const expense = await Expense_1.default.findById(req.params.id);
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');

    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to update this expense');

    const updates = { ...req.body };
    if (req.file) {
        updates.documentUrl = req.file.imageUrl;

    const updatedExpense = await Expense_1.default.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: updatedExpense });
});
exports.deleteExpense = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');

    const expense = await Expense_1.default.findById(req.params.id);
    if (!expense) {
        res.status(404);
        throw new Error('Expense not found');

    if (req.user.role !== 'Super Admin' && (!req.user.organizationId || !expense.organizationId.equals(req.user.organizationId))) {
        res.status(403);
        throw new Error('Not authorized to delete this expense');

    await expense.deleteOne();
    res.status(200).json({ success: true, data: {} });
});
//# sourceMappingURL=expenseController.js.map