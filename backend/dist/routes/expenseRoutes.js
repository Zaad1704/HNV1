"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const module_1 = require();
from;
'../controllers/expenseController';
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));
router.route('/')
    .get((0, express_async_handler_1.default)(module_1.getExpenses))
    .post(uploadMiddleware_1.default.single('document'), (0, express_async_handler_1.default)(module_1.createExpense));
router.route('/:id')
    .get((0, express_async_handler_1.default)(module_1.getExpenseById))
    .put(uploadMiddleware_1.default.single('document'), (0, express_async_handler_1.default)(module_1.updateExpense))
    .delete((0, express_async_handler_1.default)(module_1.deleteExpense));
exports.default = router;
