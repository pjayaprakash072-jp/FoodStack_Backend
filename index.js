
const dotenv = require("dotenv");
dotenv.config();
const http = require("http")
const crypto = require('crypto')
const {Server} = require('socket.io');
const app = require('./app')

const connectDB = require("./config/db");
const {connectRedis} = require('./config/redis')

const server = http.createServer(app);

const INSTANCE_ID = crypto.randomUUID();

const PORT = process.env.PORT || 5000;  
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL
].filter(Boolean);
const io = new Server(server,{
    cors:{
        origin:allowedOrigins,
        credentials:true
    }
})
// Make socket.io available in Express.
app.set("io",io);

// socker connection
io.on("connection",(socket)=>{

    console.log("Socket connected:",socket.id);
    // JOINING A ROOM.(each outlet have different rooms.)
    socket.on("join-outlet",(outletId)=>{
        if(!outletId) return ;
        const roomName = `outlet:${outletId}`;
        socket.join(roomName);
        console.log(`socket ${socket.id} joined outlet:${outletId}`)
    })
    //LEAVING ROOM
    socket.on("leave-outlet",(outletId)=>{
        if(!outletId) return ;
        const roomName = `outlet:${outletId}`;
        socket.leave(roomName);
        console.log(`socket ${socket.id} left ${roomName}`)
    })
    socket.on("disconnect",()=>{
        console.log("Socket disconnected:",socket.id);
    })
    socket.on("join-order",(orderId)=>{
        if(!orderId) return ;
        const roomName = `order:${orderId}`;
        socket.join(roomName);
        console.log(`socket ${socket.id} joined order:${orderId}`)
    })
    socket.on("leave-order",(orderId)=>{
        if(!orderId) return ;
        const roomName =`order:${orderId}`;
        socket.leave(roomName);
        console.log(`socket ${socket.in} left ${roomName}`)
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