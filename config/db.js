const mongoose = require("mongoose");
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

const connectDB = async () => {
    try {
        // Already connected
        if (mongoose.connection.readyState === 1) {
            return;
        }

        // Connection is currently being established
        // if (mongoose.connection.readyState === 2) {
        //     return;
        // }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;