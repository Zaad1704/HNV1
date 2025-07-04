"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const fixSuperAdminEmail = async () => {
    try { }
    finally {
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables.');
        await mongoose_1.default.connect(process.env.MONGO_URI);
        const result = await User_1.default.updateMany();
        { }
        role: 'Super Admin',
            isEmailVerified;
        false;
    }
    {
        $set: { }
        isEmailVerified: true,
            status;
        'active';
    }
};
;
const oldUsersResult = await User_1.default.updateMany();
{
    createdAt: {
        $lt: new Date('2025-06-26T00:00:00.000Z');
    }
    isEmailVerified: false;
}
{
    $set: {
        isEmailVerified: true;
    }
    ;
}
try { }
catch (error) {
    console.error('Fix failed:', error);
}
try { }
finally {
    await mongoose_1.default.disconnect();
}
;
fixSuperAdminEmail();
