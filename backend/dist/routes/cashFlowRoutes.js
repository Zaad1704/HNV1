"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cashFlowController_1 = require("../controllers/cashFlowController");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.get('/', cashFlowController_1.getCashFlowRecords);
router.post('/', uploadMiddleware_1.default.single('document'), cashFlowController_1.createCashFlowRecord);
router.put('/:id', cashFlowController_1.updateCashFlowRecord);
router.delete('/:id', cashFlowController_1.deleteCashFlowRecord);
exports.default = router;
