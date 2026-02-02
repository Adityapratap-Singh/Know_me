const mongoose = require('mongoose');

const connectDB = async (dbUrl) => {
    const skipDb = process.env.SKIP_DB === 'true';

    if (skipDb) {
        console.log("Skipping MongoDB connection (SKIP_DB=true)");
        // Disable buffering so models fail fast instead of hanging
        mongoose.set('bufferCommands', false);
        return;
    }

    if (!dbUrl) {
        console.error("MongoDB URI is missing!");
        return;
    }

    mongoose.set('bufferCommands', false);

    // Mongoose Connection Events
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected');
    });

    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 8000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 20000,
            family: 4
        });
    } catch (err) {
        console.error("Initial MongoDB connection error:", err);
    }
};

module.exports = connectDB;
