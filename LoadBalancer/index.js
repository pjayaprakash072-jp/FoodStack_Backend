
const express = require('express') // used to create http server

const {createProxyMiddleware} = require('http-proxy-middleware') // used to transefer request to the available(selsecteed) server 

const dotEnv = require('dotenv'); // used to process .env variables.

dotEnv.config(
    {
        path:"../.env"
    }
); // loding the . env file.

const app = express() // creating express server. THIS IS LOADBALANCER.

// the acutal servers 
const servers = [
    process.env.BACKEND_1_URL,
    process.env.BACKEND_2_URL,
    process.env.BACKEND_3_URL
].filter(Boolean)
console.log("servers " ,servers)

// creatign healthy status for each url 

const serverStatus = servers.map((server)=>(
    {
        url:server,
        healthy:false
    }
))

// create roundrobin pointer.

let currentServer = 0; // '0' because arr ind start from 0.

// creatign proxies to each server to forward request to it .
const proxies = {};
servers.forEach((server)=>{
    proxies[server] = createProxyMiddleware( // this createProxyMiddlware will create a PROXY that can forward http requests to backend server from LOADBALANCER.
        {
            target:server,
            changeOrigin:true // This tell the proxy to thand the http HOST for forwareded requests.that make like ther request is directly coming to reakcend insted of loadbalancer.
        }
    )
})
// withtout changing origin                  withtoug changing origh
// Client                                           Client
//   ↓                                          //   ↓
// localhost:3000                               // localhost:3000
//   ↓                                          //   ↓
// Proxy                                        // Proxy
//   ↓                                          //   ↓
// localhost:5001                               // localhost:5001

// Host: localhost:3000                         // Host: localhost:5001

// checking the health of server.

const checkHealth = async(server)=>{
    try {
            const response = await fetch(
                `${server.url}/health`,{
                    signal:AbortSignal.timeout(2000) // your are only allowed to check health of this with in 2 sec MAX.
                                                    // if response came then it gots to UP STATE.
                                                    // if response is not come from server then is in goes to DOWN  
                }
            )
        
            if(response.ok){ // if server responded successfully
                // if this server is priviously in DOWN then make ir up 
                if(!server.healthy){
                    console.log(`🟢 ${server.url} recovered`);
                }
                server.healthy=true
            }else{
                // server is responded with error like internal server error.
                if(server.healthy){
                    console.log(`🔴 ${server.url} is unhealthy`)
                }
                server.healthy=false
            }
    } catch (error) {
        // this happen when the server is not running, crashed, timeout happen, Network error...
        if(server.healthy){
            console.log(`🔴 ${server.url} is unhealthy`);
        }
        server.healthy= false
    }
}
// checking all servers and printing the each serverstatus.

const checkAllServer =async ()=>{
    await Promise.all(
        serverStatus.map((server)=> checkHealth(server))
    )
console.log("\nServer status:")
    serverStatus.forEach((server)=>{
        console.log(`${server.url} -> ${server.healthy ? "UP" : "DOWN"}`)
    })
}

// getting the active server to forward request.

const getNextHealthyServer = ()=>{
    const totalservers = serverStatus.length;
    for(let i = 0; i< totalservers ; i++){
        const index = (currentServer +i) % totalservers;
        const server = serverStatus[index];
        if(server.healthy){
            currentServer = (index +1)%totalservers;
            return server;
        }
    }
    return null;
}

// load balancer middle ware -> what happen when request come to loadbalancer

app.use((req,res,next)=>{

    // get healthy (runnning) server

    const server = getNextHealthyServer();

    if(!server){
        console.log(`${req.method} ${req.url} No healthy servers.`);
        return res.status(503).json(
            {
                error:"Service unavailable",
                message:"No backend server currently availbalse"
            }
        )
    }
    console.log(`${req.method} ${req.url} -> ${server.url}`)

    proxies[server.url](req,res,next); // forward the reauest.
})

// start health check immediatly

checkAllServer();

// check continously for every 5 seconds

setInterval(
    ()=>{
        checkAllServer();
    },5000
)

const PORT = 4000;
// Starting loadBalancer.
app.listen(PORT,()=>{
    console.log("LoadBalancer is runnig at port 4000");
})

// $env:PORT=5001; node index.js USE THIS TO RUN BACKEND SERVER.