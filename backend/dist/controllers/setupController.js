"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultPlans = exports.createSuperAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
const Plan_1 = __importDefault(require("../models/Plan"));
const createSuperAdmin = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Super admin already exists' });
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: 'Super Admin',
        });
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.createSuperAdmin = createSuperAdmin;
const createDefaultPlans = async (req, res) => {
    const { secretKey } = req.body;
    if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    try {
        const plansExist = await Plan_1.default.countDocuments();
        if (plansExist > 0) {
            return res.status(400).json({ success: false, message: 'Default plans have already been created.' });
        }
        const defaultPlans = [
            {
                name: 'Free Trial',
                price: 0,
                duration: 'monthly',
                isPublic: true,
                features: ['1 Property', '5 Tenants', '1 User'],
                limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 }
            },
            {
                name: 'Landlord Plan',
                price: 1000,
                duration: 'monthly',
                isPublic: true,
                features: ['Up to 10 Properties', 'Full Tenant Screening', 'Expense Tracking', 'Email Support'],
                limits: { maxProperties: 10, maxTenants: 25, maxAgents: 2 }
            },
            {
                name: 'Agent Plan',
                price: 2500,
                duration: 'monthly',
                isPublic: true,
                features: ['Unlimited Properties', 'Advanced Reporting', 'Vendor Management', 'Priority Phone Support'],
                limits: { maxProperties: 1000, maxTenants: 1000, maxAgents: 10 }
            }
        ];
        await Plan_1.default.insertMany(defaultPlans);
        res.status(201).json({ success: true, message: 'Default subscription plans created successfully!' });
    }
    catch (error) {
        console.error('Error creating default plans:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.createDefaultPlans = createDefaultPlans;
