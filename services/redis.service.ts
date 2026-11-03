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

const incrementRedisValue = async (
  key: string,
  ttl: number,
): Promise<number | null> => {
  const multi = redis.multi();

  multi.incr(key);
  multi.ttl(key);

  const result = await multi.exec();
  if (!result) {
    return null;
  }

  const count = result[0][1] as number;
  const remainingTTL = result[1][1] as number;

  if (remainingTTL === -1) {
    await redis.expire(key, ttl);
  }

  return count;
};

const getRedisTTL = async (key: string): Promise<number | null> => {
  try {
    const ttl = await redis.ttl(key);
    return ttl;
  } catch {
    return null;
  }
};

export { setRedisValue, getRedisValue, deleteRedisValue, incrementRedisValue, getRedisTTL };
