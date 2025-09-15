const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const notesRoutes = require('./routes/notes');
const errorHandler = require('./middleware/errorHandler');
const { mongo } = require('mongoose');
const mongoose = require('mongoose');

require('dotenv').config();


const app = express();

let isConnected = false;

async function connectToDatabase() {
  try{
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);  
  }
  
}

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectToDatabase();
  }
  next();
});

// (async () => {
//   try {
//     await connectDB();
//     // start listening or export app
//   } catch (error) {
//     console.error('Failed to connect to MongoDB:', error);
//     process.exit(1);
//   }
// })();

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
