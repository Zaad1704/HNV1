const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getSiteContent,
  updateSiteContent,
  getAllUsers, // Import the new function
} = require('../controllers/superAdminController');

// Import middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Define routes
// All routes in this file will be protected and require Super Admin role
router.use(protect);
router.use(authorize('Super Admin'));

// --- Site Content Routes ---
router.route('/content/:page')
  .get(getSiteContent)
  .put(updateSiteContent);

// --- User Management Route ---
// @route   GET /api/super-admin/users
// @desc    Get all users from all organizations
router.get('/users', getAllUsers);

module.exports = router;
