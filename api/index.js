require("dotenv").config({ path: "../.env" });

const app = require("../app");
const connectDB = require("../config/db");
const { connectRedis } = require("../config/redis");

let initialized = false;

const startServer = async (req, res) => {
    try {
        if (!initialized) {
            await connectDB();
            await connectRedis();

            initialized = true;
            console.log("Database and Redis initialized");
        }

        return app(req, res);

    } catch (error) {
        console.error("Server startup error:", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

module.exports = startServer;