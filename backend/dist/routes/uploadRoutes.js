"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/image', uploadController_1.uploadImage, uploadController_1.handleImageUpload);
exports.default = router;
