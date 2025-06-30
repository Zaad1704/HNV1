"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = exports.createUserService = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const createUserService = async (userData) => {
    if (!userData.password) {
        throw new Error('Password is required to create a user.');
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(userData.password, salt);
    const user = new User_1.default({
        ...userData,
        password: hashedPassword,
    });
    await user.save();
    return user;
};
exports.createUserService = createUserService;
const findUserByEmail = async (email) => {
    return User_1.default.findOne({ email });
};
exports.findUserByEmail = findUserByEmail;
