const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


let client = redis.createClient();

client.on('connect', ()=> {
  console.log('connected to Redis')
})