
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db'); // Import DB connection
const employeeRoutes = require('./routes/employees'); // Import routes

const app = express();
const PORT = process.env.PORT || 3000;

// ======= Middleware =======
app.use(cors());
app.use(express.json());

// ======= MongoDB Connection =======
connectDB();

mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

// ======= Routes =======
app.use('/api/employees', employeeRoutes);

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ NCL Employee Info Backend is Running!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbState: mongoose.connection.readyState,
    timestamp: new Date()
  });
});

// ======= Error Handler =======
app.use((err, req, res, next) => {
  console.error('❗Unhandled Error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// ======= Start Server =======
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ======= Graceful Shutdown =======
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed on exit');
  process.exit(0);
});
