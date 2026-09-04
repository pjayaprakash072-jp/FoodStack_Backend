
const dotenv = require("dotenv");
dotenv.config();

const app = require('./app')
const connectDB = require("./config/db");
const {connectRedis} = require('./config/redis')
const crypto = require('crypto')
const INSTANCE_ID = crypto.randomUUID();

const PORT = process.env.PORT || 5000;  

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

// $env:PORT=5001; node index.js USE THIS TO RUN BACKEND SERVER. WHEN U HAVE LOADBALANCER.
// this command explicitly sets the environment varialbe to PORT  to 5001 for that Powershell session.


// index.js
//    ↓
// Load environment variables
//    ↓
// Connect MongoDB
//    ↓
// Connect Redis
//    ↓
// Start HTTP server
//    ↓
// app.listen(PORT)