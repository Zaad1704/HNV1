"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const reportController_1 = require("../controllers/reportController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/collection-sheet', reportController_1.getCollectionSheet);
exports.default = router;
