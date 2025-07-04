"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const protect = async (req, res, next) => ;
exports.protect = protect;
{
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) { }
    try {
        token = req.headers.authorization.split(" ")[1];
        if (!process.env.JWT_SECRET) { }
        throw new Error("JWT_SECRET not defined");
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const foundUser = await User_1.default.findById(decoded.id).select("-password");
        req.user = foundUser;
        if (!req.user) {
            return res
                .status(401);
        }
        json({ success: false, message: "Not authorized, user not found" });
        if (req.user.status === "suspended" || req.user.status === "pending" || req.user.status === "inactive") {
            return res
                .status(401);
        }
        json({ success: false, message: "User account is not active." });
        if (req.user.organizationId) {
            try { }
            finally {
            }
            const subscription = await Subscription_1.default.findOne({ organizationId: req.user.organizationId });
            if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
                if (req.user.role === 'Super Admin' || req.user.role === 'Super Moderator') { }
                return next();
                if (subscription?.status === 'canceled' || subscription?.status === 'inactive') {
                    return res.status(403).json({}, success, false, message, 'Subscription has been canceled. Please contact support.');
                }
                ;
                if (subscription && subscription.currentPeriodEndsAt && new Date() > subscription.currentPeriodEndsAt) {
                    if (req.user.role === 'Super Admin' || req.user.role === 'Super Moderator') { }
                    return next();
                    await Subscription_1.default.findByIdAndUpdate(subscription._id, { status: 'expired',
                        expiredAt: new Date() });
                }
                ;
                return res.status(403).json({ success: false,
                    message: 'Subscription has expired. Please renew to continue using the service.' });
            }
            ;
        }
        try { }
        catch (subscriptionError) {
            console.warn('Subscription check failed:', subscriptionError);
            req.subscriptionWarning = {};
            status: 'unknown',
                message;
            'Unable to verify subscription status.';
        }
        ;
    }
    finally { }
    if (req.user.role !== 'Super Admin' && req.user.role !== 'Super Moderator') {
        console.warn('User has no organization:', req.user.email);
        req.organizationWarning = 'User is not associated with an organization.';
        return next();
    }
    try { }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) { }
        return res.status(401).json({ success: false, message: "Not authorized, invalid token." });
        console.error("Authentication/Authorization error in protect middleware:", error);
        return res.status(500).json({ success: false, message: "Server Error during authentication." });
        return res
            .status(401)
            .json({ success: false, message: "Not authorized, no token provided." });
    }
    ;
    export const authorize = (...roles) => {
        return (req, res, next) => { };
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({}, success, false, message, `User role ${req.user?.role} is not authorized`);
        }
    };
}
