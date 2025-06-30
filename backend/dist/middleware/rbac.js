"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    next();
};
exports.authorize = authorize;
