"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const runMigration = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables.');
        }
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for migration...');
        const FEATURE_ROLLOUT_DATE = new Date('2025-06-26T00:00:00.000Z');
        console.log(`Migrating users created before: ${FEATURE_ROLLOUT_DATE.toISOString()}`);
        const result = await User_1.default.updateMany({
            createdAt: { $lt: FEATURE_ROLLOUT_DATE },
            isEmailVerified: false
        }, {
            $set: { isEmailVerified: true }
        });
        console.log(`Migration complete: ${result.matchedCount} users matched, ${result.modifiedCount} users updated.`);
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('MongoDB Disconnected.');
    }
};
runMigration();
