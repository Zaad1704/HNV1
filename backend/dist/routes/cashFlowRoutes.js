"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const module_1 = require();
from;
'../controllers/cashFlowController';
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.get('/', module_1.getCashFlowRecords);
router.post('/', uploadMiddleware_1.default.single('document'), module_1.createCashFlowRecord);
router.put('/:id', module_1.updateCashFlowRecord);
router.delete('/:id', module_1.deleteCashFlowRecord);
exports.default = router;
