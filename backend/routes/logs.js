const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/auth');

// Apply auth and admin middleware to all routes in this file
router.use(protect);
router.use(adminOnly);

// @route   GET /api/logs
// @desc    Get all activity logs
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
