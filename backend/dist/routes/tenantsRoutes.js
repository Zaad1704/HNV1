"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cascadeMiddleware_1 = require("../middleware/cascadeMiddleware");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const tenantsController_1 = require("../controllers/tenantsController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(tenantsController_1.getTenants)
    .post(uploadMiddleware_1.default.fields([
    { name: 'tenantImage', maxCount: 1 },
    { name: 'govtIdFront', maxCount: 1 },
    { name: 'govtIdBack', maxCount: 1 },
    { name: 'additionalAdultImage_0', maxCount: 1 },
    { name: 'additionalAdultImage_1', maxCount: 1 },
    { name: 'additionalAdultImage_2', maxCount: 1 },
    { name: 'additionalAdultGovtId_0', maxCount: 1 },
    { name: 'additionalAdultGovtId_1', maxCount: 1 },
    { name: 'additionalAdultGovtId_2', maxCount: 1 }
]), tenantsController_1.createTenant);
router.route('/:id')
    .get(tenantsController_1.getTenantById)
    .put(tenantsController_1.updateTenant)
    .delete(async (req, res) => {
    try {
        await (0, cascadeMiddleware_1.cascadeTenantChanges)(req.params.id, 'delete', req.user.organizationId);
        (0, tenantsController_1.deleteTenant)(req, res);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cascade tenant deletion' });
    }
});
router.patch('/:id/archive', tenantsController_1.archiveTenant);
router.post('/:id/download-pdf', tenantsController_1.downloadTenantPDF);
router.post('/:id/personal-details-pdf', tenantsController_1.downloadPersonalDetailsPDF);
router.post('/:id/download-zip', tenantsController_1.downloadTenantDataZip);
router.get('/:tenantId/data-previews', tenantsController_1.getTenantDataPreviews);
router.get('/:tenantId/stats', tenantsController_1.getTenantStats);
router.get('/:tenantId/analytics', tenantsController_1.getTenantAnalytics);
exports.default = router;
