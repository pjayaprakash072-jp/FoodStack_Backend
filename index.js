const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const connectDB = require("./config/db");
const vendorRoutes = require("./routes/vendorRoutes");
const outletRoutes = require("./routes/outletRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
// Connect to MongoDB
connectDB();

const cors = require("cors");
app.use(cors());
app.use(express.json());


app.use("/vendor", vendorRoutes);
app.use("/outlet", outletRoutes);
app.use("/menu-category", menuCategoryRoutes);
app.use("/menu-item", menuItemRoutes);


const PORT = process.env.PORT || 5000;  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}   
)