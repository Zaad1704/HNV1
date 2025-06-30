"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const receiptController_1 = require("../controllers/receiptController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.get('/payment/:paymentId', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), receiptController_1.generatePaymentReceipt);
exports.default = router;
