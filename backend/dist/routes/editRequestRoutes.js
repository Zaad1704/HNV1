"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const module_1 = require();
from;
'../controllers/editRequestController';
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/', (0, rbac_1.authorize)(['Agent']), (0, express_async_handler_1.default)(module_1.createEditRequest));
router.get('/', (0, rbac_1.authorize)(['Landlord']), (0, express_async_handler_1.default)(module_1.getEditRequests));
router.put('/:id/approve', (0, rbac_1.authorize)(['Landlord']), (0, express_async_handler_1.default)(module_1.approveEditRequest));
router.put('/:id/reject', (0, rbac_1.authorize)(['Landlord']), (0, express_async_handler_1.default)(module_1.rejectEditRequest));
exports.default = router;
