"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User")); // Adjust path if you place the script elsewhere
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file, assuming it's in the project root or backend folder
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') }); // Adjust path to your .env file
const runMigration = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables.');

        await mongoose_1.default.connect(process.env.MONGO_URI);

        // IMPORTANT: Set this to the exact date and time (in UTC) when the email verification feature went live.
        // All user accounts created BEFORE this date will have their isEmailVerified flag set to true.
        const FEATURE_ROLLOUT_DATE = new Date('2025-06-26T00:00:00.000Z'); // <<< REPLACE WITH YOUR ACTUAL ROLLOUT DATE
