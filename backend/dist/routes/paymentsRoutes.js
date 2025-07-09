"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const paymentsController_1 = require("../controllers/paymentsController");
const router = (0, express_1.Router)();
router.get('/', paymentsController_1.getPayments);
router.post('/', (0, auditMiddleware_1.auditLog)('payment'), paymentsController_1.createPayment);
router.put('/:id', (0, auditMiddleware_1.auditLog)('payment'), paymentsController_1.updatePayment);
router.delete('/:id', (0, auditMiddleware_1.auditLog)('payment'), paymentsController_1.deletePayment);
router.get('/property/:propertyId/month/:month', async (req, res) => {
    try {
        const { propertyId, month } = req.params;
        const Payment = require('../models/Payment').default;
        const payments = await Payment.find({
            propertyId,
            rentMonth: month,
            organizationId: req.user.organizationId
        }).populate('tenantId', 'name unit');
        res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
