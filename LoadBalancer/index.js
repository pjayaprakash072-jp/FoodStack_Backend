const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware') // This allows loadBalancer to forward incoming requests.

const app = express();

const servers = [
    "http://localhost:5001",
    "http://localhost:5002",
    "http://localhost:5003"
];

let currentServer = 0;

// This middle ware runs for every request that comes from loadBalancer.
app.use((req,res,next)=>{
    // get the backend server that should handle.
    const target = servers[currentServer];

    console.log(`${req.method} ${req.url} ->  ${target}`)
    // move to next server to next request.
    currentServer = (currentServer+1) % servers.length;

    createProxyMiddleware({
        target:target,
        changeOrigin:true
    })(req,res,next);
})

app.listen(4000,(req,res)=>{
    console.log("Server is runnig at port 4000")
})

