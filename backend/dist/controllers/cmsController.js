"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContent = exports.getAllContent = void 0;
const CMSContent_1 = __importDefault(require("../models/CMSContent"));
async function getAllContent(_req, res, next) {
    try {
        const items = await CMSContent_1.default.find();
        res.json(items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));
    }
    catch (err) {
        next(err);
    }
}
exports.getAllContent = getAllContent;
async function updateContent(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const updates = req.body;
        const userId = req.user._id;
        const keys = Object.keys(updates);
        const results = [];
        for (const key of keys) {
            const value = updates[key];
            const updated = await CMSContent_1.default.findOneAndUpdate({ key }, { value, updatedBy: userId, updatedAt: new Date() }, { upsert: true, new: true });
            results.push(updated);
        }
        res.json({ success: true, updated: results });
    }
    catch (err) {
        next(err);
    }
}
exports.updateContent = updateContent;
