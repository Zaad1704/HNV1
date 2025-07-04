"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const expenseController_1 = require("../controllers/expenseController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(expenseController_1.getExpenses)
    .post(expenseController_1.createExpense);
router.route('/:id')
    .put(expenseController_1.updateExpense)
    .delete(expenseController_1.deleteExpense);
exports.default = router;
