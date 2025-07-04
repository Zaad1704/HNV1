"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const siteSettingsController_1 = require("../controllers/siteSettingsController");
const router = (0, express_1.Router)();
router.get('/', siteSettingsController_1.getSiteSettings);
exports.default = router;
