import redis from "@/lib/redis";

const setRedisValue = async (key: string, value: unknown, ttl?: number) => {
  const stringValue = JSON.stringify(value);

  if (ttl) {
    await redis.set(key, stringValue, "EX", ttl);
    return;
  }

  await redis.set(key, stringValue);
};

const getRedisValue = async <T>(key: string): Promise<T | null> => {
  const value = await redis.get(key);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
};

const deleteRedisValue = async (key: string) => {
  await redis.del(key);
};

export { setRedisValue, getRedisValue, deleteRedisValue };
