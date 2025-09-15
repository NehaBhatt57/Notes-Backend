const express = require('express');
const Tenant = require('../models/Tenant');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Upgrade subscription: Admin only
router.post('/:slug/upgrade', authMiddleware, adminOnly, async (req, res) => {
  try {

    const { slug } = req.params;
    if (req.user.tenant.slug !== slug)
      return res.status(403).json({ message: 'Forbidden' });

    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    if (tenant.subscription === 'pro')
      return res.status(400).json({ message: 'Already upgraded' });

    tenant.subscription = 'pro';
    await tenant.save();
    res.json({ message: `Tenant ${slug} upgraded to Pro plan.` , subscription: tenant.subscription });
  } catch (err) {
    console.error('Upgrade error:', err);
    res.status(500).json({ message: 'Server error during upgrade' });
  }
});


const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Invite user: Admin only, add user with default password "password"
router.post('/:slug/invite', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { slug } = req.params;
    const { email, role } = req.body;

    // Validate email and role presence
    if (!email || !role) return res.status(400).json({ message: 'Email and role are required' });

    // Check tenant slug matches admin's tenant slug (security)
    if (req.user.tenant.slug !== slug) return res.status(403).json({ message: 'Forbidden' });

    // Check tenant exists
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    // Check if user with email already exists (optional)
    const existingUser = await User.findOne({ email, tenantId: tenant._id });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    // Hash the default password
    const defaultPassword = 'password';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create and save new user
    const newUser = new User({
      email,
      password: passwordHash,
      role,
      tenantId: tenant._id,
    });

    await newUser.save();
    res.status(201).json({ message: `User invited successfully with role ${role}` });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
