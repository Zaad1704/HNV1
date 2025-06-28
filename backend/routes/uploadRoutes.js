const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Banner image upload
router.post('/banner', authenticateToken, requireSuperAdmin, upload.single('bannerImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      message: 'Banner image uploaded successfully'
    });
  } catch (error) {
    console.error('Banner upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload banner image' 
    });
  }
});

// Profile image upload
router.post('/profile', authenticateToken, upload.single('profileImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      message: 'Profile image uploaded successfully'
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile image' 
    });
  }
});

module.exports = router;