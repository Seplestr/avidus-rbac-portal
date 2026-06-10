const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

// Apply auth middleware to all task routes
router.use(protect);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  try {
    const task = await Task.create({
      title,
      description,
      createdBy: req.user._id,
    });

    await logActivity(
      req.user._id,
      req.user.email,
      'Task Creation',
      `Created task "${task.title}"`
    );

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks
// @desc    Get tasks (Admin views all, User views own)
// @access  Private
router.get('/', async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      // Admin sees all tasks, populated with the user who created them
      tasks = await Task.find({}).populate('createdBy', 'email').sort({ createdAt: -1 });
    } else {
      // Normal user only sees their own tasks
      tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    }

    return res.json({ success: true, tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (Only own tasks can be updated)
// @access  Private
router.put('/:id', async (req, res) => {
  const { title, description, status } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check ownership
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;

    const updatedTask = await task.save();

    await logActivity(
      req.user._id,
      req.user.email,
      'Task Update',
      `Updated task "${updatedTask.title}" (Status: ${updatedTask.status})`
    );

    return res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task (Admin can delete any, User can delete own)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Admin can delete any task, User can only delete their own
    const isOwner = task.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    const logDetails = isAdmin && !isOwner
      ? `Admin deleted task "${task.title}" created by another user`
      : `Deleted task "${task.title}"`;

    await logActivity(
      req.user._id,
      req.user.email,
      'Task Deletion',
      logDetails
    );

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
