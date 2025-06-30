"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const invitationController_1 = require("../controllers/invitationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.post('/invite-user', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(invitationController_1.inviteUser));
router.get('/accept/:token', (0, express_async_handler_1.default)(invitationController_1.getInvitationDetails));
router.post('/accept/:token', (0, express_async_handler_1.default)(invitationController_1.acceptInvitation));
router.get('/pending', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(invitationController_1.getPendingInvitations));
router.post('/:id/revoke', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(invitationController_1.revokeInvitation));
router.post('/:id/resend', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(invitationController_1.resendInvitation));
exports.default = router;
