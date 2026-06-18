const mongoose = require('mongoose');
require('dotenv').config(); // Load variables

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://ncluser:Amiteshkumar@ncl-employee-cluster.feomiic.mongodb.net/?appName=ncl-employee-cluster';
    if (!uri) throw new Error("MONGODB_URI not defined");

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
