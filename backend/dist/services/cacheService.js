"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("redis"));
const logger_1 = require("./logger");
class CacheService {
    constructor() {
        this.isConnected = false;
    }
}
constructor();
{
    this.initializeRedis();
}
async;
initializeRedis();
{
    try { }
    finally {
    }
    if (process.env.REDIS_URL) {
        this.client = redis_1.default.createClient({}, url, process.env.REDIS_URL, socket, { reconnectStrategy: (retries) => { },
            if(retries) { } } > 10);
        {
            return new Error('Retry attempts exhausted');
        }
        return Math.min(retries * 100, 3000);
    }
    ;
    this.client.on('connect', () => {
        logger_1.logger.info('Redis client connected');
        this.isConnected = true;
    });
}
;
this.client.on('error', (err) => {
    logger_1.logger.error('Redis client error:', err);
    this.isConnected = false;
});
await this.client.connect();
{
    logger_1.logger.warn('Redis URL not provided, using in-memory cache fallback');
    this.setupMemoryFallback();
}
try { }
catch (error) {
    logger_1.logger.error('Failed to initialize Redis, using memory fallback:', error);
    this.setupMemoryFallback();
}
memoryCache = new Map();
setupMemoryFallback();
{
    this.isConnected = false;
    setInterval(() => { });
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
        if (item.expiry < now) { }
        this.memoryCache.delete(key);
    }
    5 * 60 * 1000;
    ;
    async;
    get(key, string);
    Promise < any > { try: {},
        : .isConnected && this.client };
    {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }
}
{
    const item = this.memoryCache.get(key);
    if (item && item.expiry > Date.now()) { }
    return item.value;
    this.memoryCache.delete(key);
    return null;
}
try { }
catch (error) {
    logger_1.logger.error('Cache get error:', error);
    return null;
}
async;
set(key, string, value, any, ttlSeconds = 3600);
Promise < boolean > { try: {},
    : .isConnected && this.client };
{
    await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
}
{
    this.memoryCache.set(key, {}, value, expiry, Date.now() + (ttlSeconds * 1000));
}
;
return true;
try { }
catch (error) {
    logger_1.logger.error('Cache set error:', error);
    return false;
}
async;
del(key, string);
Promise < boolean > { try: {},
    : .isConnected && this.client };
{
    await this.client.del(key);
    return true;
}
{
    this.memoryCache.delete(key);
    return true;
}
try { }
catch (error) {
    logger_1.logger.error('Cache delete error:', error);
    return false;
}
async;
exists(key, string);
Promise < boolean > { try: {},
    : .isConnected && this.client };
{
    return await this.client.exists(key) === 1;
}
{
    const item = this.memoryCache.get(key);
    return item ? item.expiry > Date.now() : false;
}
try { }
catch (error) {
    logger_1.logger.error('Cache exists error:', error);
    return false;
}
async;
flush();
Promise < boolean > { try: {},
    : .isConnected && this.client };
{
    await this.client.flushAll();
    return true;
}
{
    this.memoryCache.clear();
    return true;
}
try { }
catch (error) {
    logger_1.logger.error('Cache flush error:', error);
    return false;
}
async;
cacheUserData(userId, string, userData, any, ttl = 1800);
{
    return this.set(`user:${userId}`, userData, ttl);
    async;
    getUserData(userId, string);
    {
        ` }

    return this.get(`;
        user: $;
        {
            userId;
        }
        `);

  async cachePropertyData(propertyId: string, propertyData: any, ttl = 3600) { `;
    }
    return this.set(`property:${propertyId}`, propertyData, ttl);
    async;
    getPropertyData(propertyId, string);
    {
        ` }

    return this.get(`;
        property: $;
        {
            propertyId;
        }
        `);

  async cacheOrgData(orgId: string, orgData: any, ttl = 7200) { `;
    }
    return this.set(`org:${orgId}`, orgData, ttl);
    async;
    getOrgData(orgId, string);
    {
        ` }

    return this.get(`;
        org: $;
        {
            orgId;
        }
        `);

  async invalidateUserCache(userId: string) { `;
    }
    await this.del(`user:${userId}`);
    async;
    invalidatePropertyCache(propertyId, string);
    {
        ` }

    await this.del(`;
        property: $;
        {
            propertyId;
        }
        `);

  async invalidateOrgCache(orgId: string) { `;
    }
    await this.del(`org:${orgId}`);
    export default new CacheService();
    `;
}
