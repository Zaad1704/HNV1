"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const editRequestController_1 = require("../controllers/editRequestController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// All routes in this file require an authenticated user
router.use(authMiddleware_1.protect);
// Agent creates a request
router.post('/', (0, rbac_1.authorize)(['Agent']), (0, express_async_handler_1.default)(editRequestController_1.createEditRequest));
// Landlord gets a list of their pending requests
router.get('/', (0, rbac_1.authorize)(['Landlord']), (0, express_async_handler_1.default)(editRequestController_1.getEditRequests));
// Landlord approves or rejects a specific request
router.put('/:id/approve', (0, rbac_1.authorize)(['Landlord']), (0, express_async_handler_1.default)(editRequestController_1.approveEditRequest));
router.put('/:id/reject', (0, rbac_1.authorize)(['Landlord']), (0, express_async_handler_1.default)(editRequestController_1.rejectEditRequest));
exports.default = router;
//# sourceMappingURL=editRequestRoutes.js.map