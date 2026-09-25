
const dotenv = require("dotenv");
dotenv.config();
const http = require("http")
const {Server} = require('socket.io');
const app = require('./app')
const server = http.createServer(app);

const connectDB = require("./config/db");
const {connectRedis} = require('./config/redis')
const crypto = require('crypto')
const INSTANCE_ID = crypto.randomUUID();

const PORT = process.env.PORT || 5000;  
const io = new Server(server,{
    cors:{
        origin:[
            "http://localhost:5173",
            process.env.FRONTEND_URL
        ].filter(Boolean),
        credentials:true
    }
})
app.set("io",io);
io.on("connection",(socket)=>{
    console.log("Socket connected:",socket.id);
    socket.on("join-outlet",(outletId)=>{
        if(!outletId) return ;
        const roomName = `outlet:${outletId}`;
        socket.join(roomName);
        console.log(`socket ${socket.id} joined outlet:${outletId}`)
    })
    socket.on("disconnect",()=>{
        console.log("Socket disconnected:",socket.id);
    })
})

const startServer = async ()=>{
    try {
        await connectDB();
        await connectRedis();
        server.listen(PORT, () => {
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