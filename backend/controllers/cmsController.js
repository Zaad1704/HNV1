"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllContent = getAllContent;
exports.updateContent = updateContent;
const CMSContent_1 = __importDefault(require("../models/CMSContent"));
// Get all content (for SuperAdmin)
async function getAllContent(_req, res, next) {
    try {
        const items = await CMSContent_1.default.find();
        // This reduce function is a clever way to transform the array into an object
        res.json(items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));

    catch (err) {
        next(err);


// Update or create content item
async function updateContent(req, res, next) {
    try {
        // FIX: Add a guard clause to ensure req.user is not undefined.
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });

        const updates = req.body;
        // FIX: Access the user's ID via `_id` not `id