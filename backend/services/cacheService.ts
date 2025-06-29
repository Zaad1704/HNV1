let redis: any = null;

try {
  const Redis = require('redis');
  redis = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  redis.on('error', (err: any) => console.error('Redis Client Error', err));
  redis.connect().catch(console.error);
} catch (error) {
  console.warn('Redis not available, caching disabled');
}

export const cacheService = {
  async get(key: string) {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async set(key: string, data: any, ttl: number = 3600) {
    if (!redis) return;
    try {
      await redis.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async del(key: string) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  async flush() {
    if (!redis) return;
    try {
      await redis.flushAll();
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }
};