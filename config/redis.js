const {createClient} = require('redis')// it will make connection between redis and nodejs(application);

// Create redis client 

const redisClient = createClient(
    {
        url:process.env.REDIS_URL
    }
)

// this even runs when the redis start establishing connection with redis cloud.

redisClient.on("connect",()=>{
    console.log("Redis Connection....")
})

// this event runs when redis connection successfully established connection and ready to accept commands
// commands like redisClient.get(), redis....set(), redisCli....del()...
redisClient.on("ready",()=>{
    console.log("Redis connedted successfully!");
})
// shown if error occured while connecting

redisClient.on("error",(err)=>{
    console.error("Redis Error",err);
})

// If the connection to Redis is lost the redis client may try to connect again.

redisClient.on("reconnecting",()=>{
    console.log("Redis reconnectins....");
})

// own function for connecting  to Redis.

const connectRedis = async ()=>{
    await redisClient.connect();
}





module.exports = {redisClient,connectRedis}