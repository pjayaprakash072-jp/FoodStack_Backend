const { redisClient } = require("../config/redis")

// get command
const getCache = async (key)=>{
    const data = await redisClient.get(key);
    if(!data){
        return null;
    }
    return JSON.parse(data); // converting the string data that we get from redis cloud
}

const setCache = async(key, data, ttl=30)=>{
    await redisClient.setEx(
        key,
        ttl,
        JSON.stringify(data) // convdrting josn data to string to store redis cloud, since redis will accept only key-value pairs.
    )
}

const deleteCache = async(key)=>{
    await redisClient.del(key);
}

module.exports= {
    getCache,
    setCache,
    deleteCache
}
