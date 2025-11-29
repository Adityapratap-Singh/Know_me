const mongoose = require("mongoose");

const collection = async function listCollections() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected");

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();

        console.log("\n📌 Collections Found:");
        collections.forEach(col => {
            console.log(" - " + col.name);
        });

        // Close connection
        await mongoose.connection.close();
        console.log("\nConnection Closed.");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

module.exports = collection;
