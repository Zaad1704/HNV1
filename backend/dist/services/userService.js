"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserService {
    async createUser(userData) { }
}
try {
    const user = await User_1.default.create(userData);
    return user;
}
finally {
}
try { }
catch (error) {
    console.error('User creation error:', error);
    throw error;
}
async;
updateUser(userId, string, updates, any);
Promise < any > { try: {},
    if(updates) { }, : .password };
{
    const salt = await bcryptjs_1.default.genSalt(10);
    updates.password = await bcryptjs_1.default.hash(updates.password, salt);
}
const user = await User_1.default.findByIdAndUpdate(userId, updates, { new: true });
return user;
try { }
catch (error) {
    console.error('User update error:', error);
    throw error;
}
async;
getUsersByOrganization(organizationId, string);
Promise < any[] > { try: {},
    const: users = await User_1.default.find({ organizationId }).select('-password'),
    return: users
};
try { }
catch (error) {
    console.error('Get users error:', error);
    throw error;
}
exports.default = new UserService();
