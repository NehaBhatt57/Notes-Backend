const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Acme, Globex
  slug: { type: String, required: true, unique: true }, // acme, globex
  subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
