"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Simple IP-based or default language detection (customize as needed)
router.get('/detect', (req, res) => {
    // For now, always return 'en' as the default language
    res.json({ language: "en" });
});
exports.default = router;
//# sourceMappingURL=localizationRoutes.js.map