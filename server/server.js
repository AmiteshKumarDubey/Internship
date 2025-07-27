
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); // Importing the DB connection

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Log DB connection status
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

// API routes
app.use('/api/employees', require('./routes/employees'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed on exit');
  process.exit(0);
});
