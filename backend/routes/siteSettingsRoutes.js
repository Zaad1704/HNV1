"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const siteSettingsController_1 = require("../controllers/siteSettingsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.route('/')
    .get((0, express_async_handler_1.default)(siteSettingsController_1.getSiteSettings))
    .put(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(siteSettingsController_1.updateSiteSettings));
exports.default = router;
//# sourceMappingURL=siteSettingsRoutes.js.map