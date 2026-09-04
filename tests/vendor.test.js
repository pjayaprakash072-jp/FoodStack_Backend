require('dotenv').config();
const request =  require('supertest');
const app = require('../app');
const connectDB = require('../config/db');
// const mongoose = require('mongoose') // only used here for closing mongoDB connection after use.
const {connectRedis,redisClient} = require('../config/redis')
describe('Menu Items API', () => {

    beforeAll(async()=>{
        await connectDB();
        await connectRedis();
    })

    afterAll(async()=>{
        await redisClient.quit();
        // await mongoose.connection.close();
    })
    test("Getting all Items" , async()=>{
        const response = await request(app).get('/menu-item/getall');
        expect(response.statusCode).toBe(200);
    })
    
});


// Jest
//  ↓
// dotenv loaded (12 variables)
//  ↓
// MongoDB connected ✅
//  ↓
// Redis connected ✅
//  ↓
// GET /menu-item/getall
//  ↓
// Redis CACHE MISS
//  ↓
// MongoDB fetch
//  ↓
// HTTP 200
//  ↓
// Jest test PASSED ✅