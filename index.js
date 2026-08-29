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
// Connect to MongoDB
// connectDB();

const cors = require("cors");
app.use(cors());
app.use(express.json());


app.use("/vendor", vendorRoutes);
app.use("/outlet", outletRoutes);
app.use("/menu-category", menuCategoryRoutes);
app.use("/menu-item", menuItemRoutes);
app.get('/',(req,res)=>{
    res.send("Welcome to FoodStack!")
})


const PORT = process.env.PORT || 5000;  


const startServer = async ()=>{
    try {
        await connectDB();
        await connectRedis();
        app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            }   
        )
    } catch (error) {
        console.log("Server startup error",error);
        process.exit(1);
    }
}

startServer();