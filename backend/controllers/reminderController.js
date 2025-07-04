"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOverdueReminders = exports.deleteReminder = exports.updateReminder = exports.getReminders = exports.createReminder = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Reminder_1 = __importDefault(require("../models/Reminder"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const emailService_1 = __importDefault(require("../services/emailService"));
const date_fns_1 = require("date-fns");
const calculateNextRunDate = (currentDate, frequency) => {
    switch (frequency) {
        case 'daily': return (0, date_fns_1.addDays)(currentDate, 1);
        case 'weekly': return (0, date_fns_1.addWeeks)(currentDate, 1);
        case 'monthly': return (0, date_fns_1.addMonths)(currentDate, 1);
        case 'yearly': return (0, date_fns_1.addYears)(currentDate, 1);
        default: return (0, date_fns_1.addDays)(currentDate, 1);

};
exports.createReminder = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');

    const { tenantId, type, message, frequency, nextRunDate } = req.body;
    if (!tenantId || !type || !frequency || !nextRunDate) {
        res.status(400);
        throw new Error('Tenant, type, frequency, and next run date are required.');

    const tenant = await Tenant_1.default.findById(tenantId);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Tenant not found in your organization.');

    const reminder = await Reminder_1.default.create({
        organizationId: req.user.organizationId,
        tenantId: tenant._id,
        propertyId: tenant.propertyId,
        type,
        message,
        nextRunDate: new Date(nextRunDate),
        frequency,
        status: 'active',
        sentCount: 0,
    });
    res.status(201).json({ success: true, data: reminder });
});
exports.getReminders = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');

    const query = (req.user.role === 'Super Admin' || !req.user.organizationId) ? {} : { organizationId: req.user.organizationId };
    const reminders = await Reminder_1.default.find(query)
        .populate('tenantId', 'name email unit')
        .populate('propertyId', 'name')
        .sort({ nextRunDate: 1 });
    res.status(200).json({ success: true, data: reminders });
});
exports.updateReminder = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');

    const { id } = req.params;
    const updates = req.body;
    const reminder = await Reminder_1.default.findById(id);
    if (!reminder || reminder.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Reminder not found or unauthorized.');

    Object.assign(reminder, updates);
    if (updates.nextRunDate) {
        reminder.nextRunDate = new Date(updates.nextRunDate);

    await reminder.save();
    res.status(200).json({ success: true, data: reminder });
});
exports.deleteReminder = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');

    const { id } = req.params;
    const reminder = await Reminder_1.default.findById(id);
    if (!reminder || reminder.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Reminder not found or unauthorized.');

    await reminder.deleteOne();
    res.status(200).json({ success: true, message: 'Reminder deleted.' });
});
exports.processOverdueReminders = (0, express_async_handler_1.default)(async (req, res) => {
    const now = new Date();
    const overdueReminders = await Reminder_1.default.find({
        nextRunDate: { $lte: now },
        status: 'active',
    }).populate('tenantId').populate('propertyId');
    let sentCount = 0;
    for (const reminder of overdueReminders) {
        try {
            const tenant = reminder.tenantId;
            const propertyName = reminder.propertyId?.name || 'your property';
            if (!tenant || !tenant.email) {
                console.warn(`Reminder ${reminder._id}: Tenant not found or has no email. Skipping.
            let subject = `Rent Reminder for ${propertyName} - Unit ${tenant.unit}
            let messageBody = reminder.message || 
      
            console.error(`Error processing reminder ${reminder._id}:
    res.status(200).json({ success: true, message: `Processed ${sentCount} overdue reminders.