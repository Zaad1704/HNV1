"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const module_1 = require();
from;
'../controllers/userController';
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.put('/update-password', (0, express_async_handler_1.default)(module_1.updatePassword));
router.post('/request-deletion', (0, express_async_handler_1.default)(module_1.requestAccountDeletion));
router.route('/')
    .get((0, authMiddleware_1.authorize)('Super Admin', 'Landlord', 'Agent'), (0, express_async_handler_1.default)(module_1.getUsers));
router
    .route('/:id')
    .get((0, authMiddleware_1.authorize)('Super Admin'), (0, express_async_handler_1.default)(module_1.getUser))
    .put((0, authMiddleware_1.authorize)('Super Admin'), (0, express_async_handler_1.default)(module_1.updateUser))
    .delete((0, authMiddleware_1.authorize)('Super Admin'), (0, express_async_handler_1.default)(module_1.deleteUser));
router.get('/organization', (0, authMiddleware_1.authorize)('Super Admin', 'Landlord', 'Agent'), (0, express_async_handler_1.default)(module_1.getOrgUsers));
router.get('/my-agents', (0, authMiddleware_1.authorize)('Super Admin', 'Landlord'), (0, express_async_handler_1.default)(module_1.getManagedAgents));
exports.default = router;
