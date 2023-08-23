import Redis from "ioredis";
import { promisify } from "util";

const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});

function getRedis(key: string) {
  const syncRedisGet = promisify(redisClient.get).bind(redisClient);
  return syncRedisGet(key);
}

function setRedis(key: string, value: string) {
  const syncRedisSet = promisify(redisClient.set).bind(redisClient);
  return syncRedisSet(key, value);
}

function deleteRedis(key: string) {
  const syncRedisDel = promisify(redisClient.del).bind(redisClient);
  return syncRedisDel(key);
}

export { redisClient, getRedis, setRedis };
