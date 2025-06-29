"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const translationController_1 = require("../controllers/translationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// This route is protected, so only logged-in users can use the translation service.
router.post('/', authMiddleware_1.protect, (0, express_async_handler_1.default)(translationController_1.translateContent));
exports.default = router;
//# sourceMappingURL=translationRoutes.js.map