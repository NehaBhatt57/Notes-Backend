const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const { authMiddleware } = require('../middleware/auth'); 

const router = express.Router();

// Predefined tenants for testing
const predefinedTenants = [
  { name: 'Acme', slug: 'acme' },
  { name: 'Globex', slug: 'globex' },
];

// Predefined users for testing with hashed passwords for 'password'
const predefinedUsers = [
  { email: 'admin@acme.test', role: 'admin', tenantSlug: 'acme' },
  { email: 'user@acme.test', role: 'member', tenantSlug: 'acme' },
  { email: 'admin@globex.test', role: 'admin', tenantSlug: 'globex' },
  { email: 'user@globex.test', role: 'member', tenantSlug: 'globex' },
];

// Utility to create tenants if not exist
const initializeTenants = async () => {
  console.log('Initializing predefined tenants...');
  for (const tenantData of predefinedTenants) {
    let tenant = await Tenant.findOne({ slug: tenantData.slug });
    if (!tenant) {
      tenant = new Tenant(tenantData);
      await tenant.save();
      console.log(`Created tenant: ${tenant.slug}`);
    } else {
      console.log(`Tenant exists: ${tenant.slug}`);
    }
  }
};

// Utility to create users if not exist (bcrypt password: 'password')
const initializeUsers = async () => {
  console.log('Initializing predefined users...');
  for (const userData of predefinedUsers) {
    const tenant = await Tenant.findOne({ slug: userData.tenantSlug });
    if (!tenant) {
      console.log(`Skipping user creation; tenant not found: ${userData.tenantSlug}`);
      continue;
    }
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      const passwordHash = await bcrypt.hash('password', 10);
      user = new User({
        email: userData.email,
        password: passwordHash,
        role: userData.role,
        tenantId: tenant._id,
      });
      await user.save();
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User exists: ${user.email}`);
    }
  }
};

// Call initialization once, tenants first
initializeTenants()
  .then(() => initializeUsers())
  .catch(console.error);

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for email: ${email}`);

  const user = await User.findOne({ email }).populate('tenantId');
  console.log(`User found: ${user ? user.email : 'none'}`);

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const payload = {
    userId: user._id,
    tenantId: user.tenantId._id,
    tenantSlug: user.tenantId.slug,
    tenantSubscription: user.tenantId.subscription,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({
    token,
    tenant: user.tenantId.slug,
    role: user.role,
    email: user.email,
    subscription: user.tenantId.subscription, 
  });
});



// New endpoint: GET /api/auth/me
// Returns current authenticated user info
router.get('/me', authMiddleware, async (req, res) => {
  try {

    const user = await User.findById(req.user.id).populate('tenantId');

    console.log(`Auth/me user: ${user ? user.email : 'not found'}`);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      role: user.role,
      email: user.email,
      tenant: {
        id: user.tenantId._id,
        slug: user.tenantId.slug,
        name: user.tenantId.name,
        subscription: user.tenantId.subscription,
      },
    });
  } catch (error) {
    console.error('Auth/me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
