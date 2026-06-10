const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

// Apply auth and admin middleware to all routes in this file
router.use(protect);
router.use(adminOnly);

// @route   GET /api/analytics
// @desc    Get dashboard metrics (Total users, tasks, completed, pending)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTasks = await Task.countDocuments({});
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
