import Redis from 'redis';
import { logger } from './logger';

class CacheService {
  private client: any;
  private isConnected = false;

  constructor() {
    this.initializeRedis();

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.client = Redis.createClient({
          url: process.env.REDIS_URL,
          socket: {
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                return new Error('Retry attempts exhausted');

              return Math.min(retries * 100, 3000);


        });

        this.client.on('connect', () => {
          logger.info('Redis client connected');
          this.isConnected = true;
        });

        this.client.on('error', (err: Error) => {
          logger.error('Redis client error:', err);
          this.isConnected = false;
        });

        await this.client.connect();
      } else {
        logger.warn('Redis URL not provided, using in-memory cache fallback');
        this.setupMemoryFallback();

    } catch (error) {
      logger.error('Failed to initialize Redis, using memory fallback:', error);
      this.setupMemoryFallback();


  private memoryCache = new Map<string, { value: any; expiry: number }>();

  private setupMemoryFallback() {
    this.isConnected = false;
    // Clean expired entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.memoryCache.entries()) {
        if (item.expiry < now) {
          this.memoryCache.delete(key);


    }, 5 * 60 * 1000);

  async get(key: string): Promise<any> {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Memory fallback
        const item = this.memoryCache.get(key);
        if (item && item.expiry > Date.now()) {
          return item.value;

        this.memoryCache.delete(key);
        return null;

    } catch (error) {
      logger.error('Cache get error:', error);
      return null;


  async set(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
        return true;
      } else {
        // Memory fallback
        this.memoryCache.set(key, {
          value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
        return true;

    } catch (error) {
      logger.error('Cache set error:', error);
      return false;


  async del(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
        return true;
      } else {
        this.memoryCache.delete(key);
        return true;

    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;


  async exists(key: string): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        return await this.client.exists(key) === 1;
      } else {
        const item = this.memoryCache.get(key);
        return item ? item.expiry > Date.now() : false;

    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;


  async flush(): Promise<boolean> {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushAll();
        return true;
      } else {
        this.memoryCache.clear();
        return true;

    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;


  // Cache patterns for common use cases
  async cacheUserData(userId: string, userData: any, ttl = 1800) {
    return this.set(`user:${userId}
    return this.get(`user:${userId}
    return this.set(`property:${propertyId}
    return this.get(`property:${propertyId}
    return this.set(`org:${orgId}
    return this.get(`org:${orgId}
    await this.del(`user:${userId}
    await this.del(`property:${propertyId}
    await this.del(`org:${orgId}