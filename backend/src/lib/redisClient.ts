import { createClient } from "redis";

console.log("REDIS_URL", process.env.REDIS_URL);

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Error", err));

redisClient.connect();

export default redisClient;
