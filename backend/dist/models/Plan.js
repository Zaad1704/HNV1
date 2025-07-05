"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const planSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly',
    },
    interval: {
        type: String,
        enum: ['month', 'monthly', 'yearly'],
        default: 'monthly'
    },
    features: { type: [String], default: [] },
    limits: {
        maxProperties: { type: Number, default: 1 },
        maxTenants: { type: Number, default: 5 },
        maxAgents: { type: Number, default: 0 },
    },
    maxProperties: { type: Number, default: 1 },
    maxUsers: { type: Number, default: 1 },
    maxTenants: { type: Number, default: 5 },
    maxAgents: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    trialDays: { type: Number, default: 14 },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Plan', planSchema);
