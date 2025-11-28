const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
    try {
        if (!process.env.mongo_url) {
            throw new Error("MongoDB URL not found in environment variables");
        }

        await mongoose.connect(process.env.mongo_url);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
    }
}

module.exports = connectDB;
