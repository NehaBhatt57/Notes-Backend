const express = require('express');
const Note = require('../models/Note');
const { authMiddleware } = require('../middleware/auth');
const { NOTE_LIMIT_FREE } = require('../utils/constants');

const router = express.Router();

// Middleware: Require authenticated user for all /notes routes
router.use(authMiddleware);

const roleAllowed = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

// Create note
router.post('/', roleAllowed(['admin', 'member']), async (req, res) => {
  try {
    const { title, content } = req.body;
    const tenantId = req.user.tenant.id;
    const userId = req.user.id;

    // Enforce Free plan note limit
    if (req.user.tenant.subscription === 'free') {
const count = await Note.countDocuments({ tenantId, userId });
      if (count >= NOTE_LIMIT_FREE) {
        return res.status(403).json({ message: 'Note limit reached. Please upgrade.' });
      }
    }

    const note = new Note({ tenantId, userId, title, content });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List all notes for tenant
router.get('/', roleAllowed(['admin', 'member']), async (req, res) => {
  try {
    const tenantId = req.user.tenant.id;
    const userId = req.user.id;
    // Only fetch notes that belong to THIS user and THIS tenant
    const notes = await Note.find({ tenantId, userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Get note by id (tenant isolation check)
router.get('/:id', roleAllowed(['admin', 'member']), async (req, res) => {
  try {
    const tenantId = req.user.tenant.id;
    const note = await Note.findOne({ _id: req.params.id, tenantId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update note (tenant isolation)
router.put('/:id', roleAllowed(['admin', 'member']), async (req, res) => {
  try {
    const tenantId = req.user.tenant.id;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, tenantId },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note (tenant isolation)
router.delete('/:id', roleAllowed(['admin', 'member']), async (req, res) => {
  try {
    const tenantId = req.user.tenant.id;
    const note = await Note.findOneAndDelete({ _id: req.params.id, tenantId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
