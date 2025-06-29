"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler")); // Import asyncHandler
const propertyController_1 = require("../controllers/propertyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware")); // Import upload middleware
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect); // This applies protect middleware to all routes below
router.route('/')
    .get((0, express_async_handler_1.default)(propertyController_1.getProperties))
    // Use upload.single('image') to handle one file with the field name 'image'
    .post(uploadMiddleware_1.default.single('image'), (0, express_async_handler_1.default)(propertyController_1.createProperty));
router.route('/:id')
    .get((0, express_async_handler_1.default)(propertyController_1.getPropertyById))
    // Also apply the middleware to the update route
    .put(uploadMiddleware_1.default.single('image'), (0, express_async_handler_1.default)(propertyController_1.updateProperty))
    .delete((0, express_async_handler_1.default)(propertyController_1.deleteProperty));
exports.default = router;
//# sourceMappingURL=propertiesRoutes.js.map