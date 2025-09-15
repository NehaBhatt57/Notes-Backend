const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const notesRoutes = require('./routes/notes');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();


const app = express();
(async () => {
  try {
    await connectDB();
    // start listening or export app
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})();

// connectDB();

app.use(cors({
  origin: '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Simple request logger middleware
app.get('/', (req, res) => {
  res.send('Hello, welcome to the Multi-Tenant Notes API!');
});
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/notes', notesRoutes);

app.use(errorHandler);

module.exports = app;
