require('dotenv').config();
const connectDB = require("../config/db");
const mongoose = require('mongoose')
const {connectRedis, redisClient} = require("../config/redis")

beforeAll( async ()=>{
    await connectDB();
    await connectRedis();
});

afterAll( async ()=>{
    await redisClient.quit();
    await mongoose.connection.close();
})