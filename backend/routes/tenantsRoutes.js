"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tenantsController_1 = require("../controllers/tenantsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
const tenantUploadFields = [
    { name: "imageUrl", maxCount: 1 },
    { name: "govtIdImageUrlFront", maxCount: 1 },
    { name: "govtIdImageUrlBack", maxCount: 1 },
];
router
    .route("/")
    .get((0, express_async_handler_1.default)(tenantsController_1.getTenants))
    .post(uploadMiddleware_1.default.fields(tenantUploadFields), (0, express_async_handler_1.default)(tenantsController_1.createTenant));
router
    .route("/:id")
    .get((0, express_async_handler_1.default)(tenantsController_1.getTenantById))
    .put(uploadMiddleware_1.default.fields(tenantUploadFields), (0, express_async_handler_1.default)(tenantsController_1.updateTenant))
    .delete((0, express_async_handler_1.default)(tenantsController_1.deleteTenant));
exports.default = router;
//# sourceMappingURL=tenantsRoutes.js.map