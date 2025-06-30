"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const orgController_1 = require("../controllers/orgController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/me', (0, express_async_handler_1.default)(orgController_1.getOrganizationDetails));
router.get('/', (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(orgController_1.listOrganizations));
router.put('/:id/status', (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(orgController_1.setOrgStatus));
exports.default = router;
