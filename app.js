const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();


const vendorRoutes = require("./routes/vendorRoutes");
const outletRoutes = require("./routes/outletRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const customer = require('./routes/Customer/customerRoutes')


const { redisClient } = require("./config/redis")


const INSTANCE_ID = crypto.randomUUID();

const PORT = process.env.PORT || 5000;  


app.use(cors());
app.use(express.json());


app.use("/vendor", vendorRoutes);
app.use("/outlet", outletRoutes);
app.use("/menu-category", menuCategoryRoutes);
app.use("/menu-item", menuItemRoutes);
app.use("/customer",customer)
// HOME route.
app.get('/',(req,res)=>{
    res.send("Welcome to FoodStack!")
})
// health Check.

app.get("/health" , (req,res)=>{
    return res.status(200).json(
        {
            status:"ok"
        }
    )
})



// checking is Redis is shared.
// ===============================
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


module.exports = app;

// app.js
//    ↓
// Create Express application
//    ↓
// Middleware
//    ↓
// Routes
//    ↓
// Export app