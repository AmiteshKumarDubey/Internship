const mongoose = require('mongoose');
require('dotenv').config(); // Load variables

const connectDB = async () => {
  try {
    // Using hardcoded URI - env var was corrupted on Render
    const uri = 'mongodb+srv://ncluser:Amitesh1234@ncl-employee-cluster.feomiic.mongodb.net/?appName=ncl-employee-cluster';

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
