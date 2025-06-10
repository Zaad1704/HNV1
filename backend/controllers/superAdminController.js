const SiteContent = require('../models/SiteContent');
const User = require('../models/User');
const Organization = require('../models/Organization'); // We need this model now

// @desc    Get site content for a specific page
// @route   GET /api/super-admin/content/:page
exports.getSiteContent = async (req, res, next) => {
  try {
    let content = await SiteContent.findOne({ page: req.params.page });

    if (!content) {
      content = await SiteContent.create({
        page: req.params.page,
        content: {
          heroTitle: `Welcome to ${req.params.page} page!`,
          heroSubtitle: 'This content is editable by the Super Admin.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update site content for a specific page
// @route   PUT /api/super-admin/content/:page
exports.updateSiteContent = async (req, res, next) => {
  try {
    const pageContent = await SiteContent.findOneAndUpdate(
      { page: req.params.page },
      { content: req.body, lastUpdated: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: pageContent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all users from all organizations
// @route   GET /api/super-admin/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({})
            .populate('organizationId', 'name') // Populate the organization's name
            .select('-password'); // Exclude passwords from the result

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
