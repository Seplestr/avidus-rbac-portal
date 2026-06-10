const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, email, action, details) => {
  try {
    const log = new ActivityLog({
      userId,
      email,
      action,
      details,
    });
    await log.save();
    console.log(`[ACTIVITY LOG] User: ${email} | Action: ${action} | Details: ${details}`);
  } catch (error) {
    console.error(`Failed to save activity log: ${error.message}`);
  }
};

module.exports = { logActivity };
