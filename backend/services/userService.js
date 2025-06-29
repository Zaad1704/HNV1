"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = exports.createUserService = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs")); // CORRECTED IMPORT
/**
 * Creates a new user in the database with a hashed password.
 * @param userData - The user data, including a plain text password.
 * @returns The newly created user document.
 */
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
/**
 * Finds a user by their email address.
 * @param email - The email of the user to find.
 * @returns The user document or null if not found.
 */
const findUserByEmail = async (email) => {
    return User_1.default.findOne({ email });
};
exports.findUserByEmail = findUserByEmail;
//# sourceMappingURL=userService.js.map