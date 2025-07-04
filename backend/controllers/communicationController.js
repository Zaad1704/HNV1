"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRentReminder = exports.sendCustomEmail = void 0;
const emailService_1 = __importDefault(require("../services/emailService"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const sendCustomEmail = async (req, res) => {
    const { recipientEmail, subject, message } = req.body;
    const sender = req.user;
    if (!recipientEmail || !subject || !message) {
        res.status(400).json({ success: false, message: 'Recipient, subject, and message are required.' });
        return;

    if (!sender || !sender.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    try {
        const tenant = await Tenant_1.default.findOne({ email: recipientEmail, organizationId: sender.organizationId });
        if (!tenant) {
            res.status(403).json({ success: false, message: "You do not have permission to contact this recipient." });
            return;

        await emailService_1.default.sendEmail(recipientEmail, subject, 'customMessage', {
            senderName: sender.name || "The Management",
            messageBody: message.replace(/\n/g, '<br>')
        });
        res.status(200).json({ success: true, message: 'Email sent successfully.' });

    catch (error) {
        console.error('Failed to send custom email:', error);
        res.status(500).json({ success: false, message: 'Server error: Could not send email.' });

};
exports.sendCustomEmail = sendCustomEmail;
const sendRentReminder = async (req, res) => {
    const { tenantId } = req.body;
    const sender = req.user;
    if (!tenantId) {
        res.status(400);
        throw new Error('Tenant ID is required.');

    if (!sender || !sender.organizationId) {
        res.status(401);
        throw new Error('Not authorized or not part of an organization.');

    try {
        const tenant = await Tenant_1.default.findById(tenantId).populate('propertyId', 'name');
        if (!tenant || tenant.organizationId.toString() !== sender.organizationId.toString()) {
            res.status(404);
            throw new Error('Tenant not found in your organization.');

        const senderName = sender.name || (sender.role === 'Landlord' ? 'Your Landlord' : 'Your Agent');
        const senderEmail = sender.email;
        const propertyName = tenant.propertyId?.name || 'your property';
        const subject = `Rent Payment Reminder for Unit ${tenant.unit} - ${propertyName}
        const messageBody = 
        
        res.status(200).json({ success: true, message: `Rent reminder sent to ${tenant.email}