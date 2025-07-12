"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const unitController_1 = require("../controllers/unitController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cascadeMiddleware_1 = require("../middleware/cascadeMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(propertyController_1.getProperties)
    .post(uploadMiddleware_1.default.single('image'), propertyController_1.createProperty);
router.route('/:id')
    .get(propertyController_1.getPropertyById)
    .put(uploadMiddleware_1.default.single('image'), propertyController_1.updateProperty)
    .delete(async (req, res) => {
    try {
        await (0, cascadeMiddleware_1.cascadePropertyChanges)(req.params.id, 'delete', req.user?.organizationId?.toString());
        (0, propertyController_1.deleteProperty)(req, res);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cascade property deletion' });
    }
});
router.patch('/:id/archive', async (req, res) => {
    try {
        await (0, cascadeMiddleware_1.cascadePropertyChanges)(req.params.id, 'archive', req.user?.organizationId?.toString());
        const Property = require('../models/Property').default;
        await Property.findByIdAndUpdate(req.params.id, { status: 'Archived' });
        res.status(200).json({ success: true, message: 'Property and related data archived' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to archive property' });
    }
});
router.get('/:propertyId/data-previews', propertyController_1.getPropertyDataPreviews);
router.get('/:propertyId/units/:unitNumber/data', propertyController_1.getUnitData);
router.get('/:propertyId/units', propertyController_1.getPropertyUnits);
router.get('/:propertyId/vacant-units', unitController_1.getVacantUnits);
router.get('/validate/data-integrity', propertyController_1.validateDataIntegrity);
router.put('/:id/regenerate-description', propertyController_1.regenerateDescription);
exports.default = router;
