"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const sharingController_1 = require("../controllers/sharingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Endpoint to create a share link (requires user to be logged in)
router.post('/expense-document/:expenseId', authMiddleware_1.protect, (0, express_async_handler_1.default)(sharingController_1.createShareLink));
// Public endpoint for anyone with the token to view the document
router.get('/view/:token', (0, express_async_handler_1.default)(sharingController_1.viewSharedDocument));
exports.default = router;
//# sourceMappingURL=sharingRoutes.js.map