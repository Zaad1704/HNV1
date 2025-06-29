"use strict";
// backend/routes/feedbackRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController_1 = require("../controllers/feedbackController");
const router = (0, express_1.Router)();
// @route   POST /api/feedback
// @desc    Handles submission of the user feedback form
// @access  Public
router.post('/', feedbackController_1.handleFeedbackSubmission);
exports.default = router;
//# sourceMappingURL=feedbackRoutes.js.map