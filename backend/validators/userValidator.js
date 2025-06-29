"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Name is required" }),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long" }),
    role: zod_1.z.enum(["Landlord", "Agent"]),
});
//# sourceMappingURL=userValidator.js.map