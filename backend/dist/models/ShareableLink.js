"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const ShareableLinkSchema = new mongoose_1.Schema({
    token: { type: String, required: true, unique: true, index: true },
    documentUrl: { type: String, required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
ShareableLinkSchema.pre('validate', function (next) {
    if (this.isNew) {
        this.token = crypto_1.default.randomBytes(24).toString('hex');
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    next();
});
exports.default = (0, mongoose_1.model)('ShareableLink', ShareableLinkSchema);
