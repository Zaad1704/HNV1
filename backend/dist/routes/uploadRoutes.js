"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const fileUploadController_1 = require("../controllers/fileUploadController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.post();
'/image',
    authMiddleware_1.protect,
    (0, rbac_1.authorize)(['Super Admin', 'Super Moderator']),
    uploadMiddleware_1.default.single('image'),
    (0, express_async_handler_1.default)(fileUploadController_1.uploadImage);
;
exports.default = router;
