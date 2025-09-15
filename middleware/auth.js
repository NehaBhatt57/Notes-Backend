const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Missing authorization header' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('tenantId');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      tenant: {
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        subscription: user.tenantId.subscription,
      },
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admins only' });
  next();
};

module.exports = { authMiddleware, adminOnly };
