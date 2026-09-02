const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const {connectRedis} = require('./config/redis')
const connectDB = require("./config/db");
const vendorRoutes = require("./routes/vendorRoutes");
const outletRoutes = require("./routes/outletRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const { redisClient } = require("./config/redis")
const crypto = require('crypto')
const INSTANCE_ID = crypto.randomUUID();
// Connect to MongoDB
// connectDB();
const PORT = process.env.PORT || 5000;  

const cors = require("cors");
app.use(cors());
app.use(express.json());

app.get("/health" , (req,res)=>{
    return res.status(200).json(
        {
            status:"ok",
            instance:INSTANCE_ID,
            port:PORT
        }
    )
})
app.use("/vendor", vendorRoutes);
app.use("/outlet", outletRoutes);
app.use("/menu-category", menuCategoryRoutes);
app.use("/menu-item", menuItemRoutes);
app.get('/',(req,res)=>{
    res.send("Welcome to FoodStack!")
})

// const testRedis = async ()=>{

//     await redisClient.set("key","hello");
//     console.log(await redisClient.get("key"));
// }


// checkign is Redis is shared.
// Store something in Redis
app.get("/redis/set", async (req,res)=>{
    try{
        await redisClient.set("key","seted to redis");
        res.status(200).json(
            {
                message:"Set data in redis",
                instance:INSTANCE_ID,
                port:PORT
            }
        )
    }catch(err){
        console.log("Failed to set data to redis");
        res.status(500).json(
            {
                messsage:"Failed to set data to redis",
            }
        )
    }
})


// Read something from Redis
app.get("/redis/get", async (req, res) => {
    try {
        const value = await redisClient.get("key");

        res.json({
            message: "Value retrieved from Redis",
            value: value,
            instance: INSTANCE_ID,
            port: PORT
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Redis get failed"
        });
    }
});





const startServer = async ()=>{
    try {
        await connectDB();
        await connectRedis();
        app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT} || Instance: ${INSTANCE_ID}`);
            }   
        )
        // test();
    } catch (error) {
        console.log("Server startup error",error);
        process.exit(1);
    }
}

startServer();