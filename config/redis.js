const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("connect", () => {
    console.log("Redis connecting...");
});

redisClient.on("ready", () => {
    console.log("Redis connected successfully!");
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

redisClient.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

module.exports = {
    redisClient,
    connectRedis
};