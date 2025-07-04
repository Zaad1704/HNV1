"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: ['Repairs', 'Utilities', 'Management Fees', 'Insurance', 'Taxes', 'Salary', 'Other'], // Added 'Salary'
        required: true,
    },
    date: { type: Date, default: Date.now, required: true },
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    documentUrl: {
        type: String,
    },
    paidToAgentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'

}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Expense', ExpenseSchema);
//# sourceMappingURL=Expense.js.map