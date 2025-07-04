"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription")); // Import Subscription model
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET not defined");

            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const foundUser = await User_1.default.findById(decoded.id).select("-password");
            req.user = foundUser;
            if (!req.user) {
                return res
                    .status(401)
                    .json({ success: false, message: "Not authorized, user not found" });

            // Check user's individual status (e.g., suspended by admin)
            if (req.user.status === "suspended" || req.user.status === "pending") {
                return res
                    .status(401)
                    .json({ success: false, message: "User account is not active." });

            // NEW LOGIC: Check organization's subscription status
            if (req.user.organizationId) {
                const subscription = await Subscription_1.default.findOne({ organizationId: req.user.organizationId });
                if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
                    // Allow Super Admin even if subscription is inactive/canceled
                    if (req.user.role === 'Super Admin') {
                        return next();

                    // For other roles, deny access if subscription is not active or trialing
                    // REVERTED: Changed back to 403 status with message for frontend interceptor
                    return res.status(403).json({ success: false, message: "Your organization's subscription is not active. Please renew to continue accessing features." });


            else {
                // If user has no organizationId, they cannot access protected routes
                // This case might occur if an organization was deleted but user still exists.
                return res.status(403).json({ success: false, message: "User is not associated with an organization." });

            return next(); // Proceed if user and subscription are active

        catch (error) {
            // Differentiate between token errors and other errors
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({ success: false, message: "Not authorized, invalid token." });

            console.error("Authentication/Authorization error in protect middleware:", error);
            return res.status(500).json({ success: false, message: "Server Error during authentication." });


    return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token provided." });
};
exports.protect = protect;
// The authorize function remains the same
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `User role ${req.user?.role} is not authorized