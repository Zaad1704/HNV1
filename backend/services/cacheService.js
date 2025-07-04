"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const redis_1 = __importDefault(require("redis"));
const logger_1 = require("./logger");
class CacheService {
    constructor() {
        this.isConnected = false;
        this.memoryCache = new Map();
        this.initializeRedis();

    async initializeRedis() {
        try {
            if (process.env.REDIS_URL) {
                this.client = redis_1.default.createClient({
                    url: process.env.REDIS_URL,
                    retry_strategy: (options) => {
                        if (options.error && options.error.code === 'ECONNREFUSED') {
                            logger_1.logger.error('Redis server connection refused');
                            return new Error('Redis server connection refused');

                        if (options.total_retry_time > 1000 * 60 * 60) {
                            return new Error('Retry time exhausted');

                        if (options.attempt > 10) {
                            return undefined;

                        return Math.min(options.attempt * 100, 3000);

                });
                this.client.on('connect', () => {
                    logger_1.logger.info('Redis client connected');
                    this.isConnected = true;
                });
                this.client.on('error', (err) => {
                    logger_1.logger.error('Redis client error:', err);
                    this.isConnected = false;
                });
                await this.client.connect();

            else {
                logger_1.logger.warn('Redis URL not provided, using in-memory cache fallback');
                this.setupMemoryFallback();


        catch (error) {
            logger_1.logger.error('Failed to initialize Redis, using memory fallback:', error);
            this.setupMemoryFallback();


    setupMemoryFallback() {
        this.isConnected = false;
        // Clean expired entries every 5 minutes
        setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.memoryCache.entries()) {
                if (item.expiry < now) {
                    this.memoryCache.delete(key);


        }, 5 * 60 * 1000);

    async get(key) {
        try {
            if (this.isConnected && this.client) {
                const value = await this.client.get(key);
                return value ? JSON.parse(value) : null;

            else {
                // Memory fallback
                const item = this.memoryCache.get(key);
                if (item && item.expiry > Date.now()) {
                    return item.value;

                this.memoryCache.delete(key);
                return null;


        catch (error) {
            logger_1.logger.error('Cache get error:', error);
            return null;


    async set(key, value, ttlSeconds = 3600) {
        try {
            if (this.isConnected && this.client) {
                await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
                return true;

            else {
                // Memory fallback
                this.memoryCache.set(key, {
                    value,
                    expiry: Date.now() + (ttlSeconds * 1000)
                });
                return true;


        catch (error) {
            logger_1.logger.error('Cache set error:', error);
            return false;


    async del(key) {
        try {
            if (this.isConnected && this.client) {
                await this.client.del(key);
                return true;

            else {
                this.memoryCache.delete(key);
                return true;


        catch (error) {
            logger_1.logger.error('Cache delete error:', error);
            return false;


    async exists(key) {
        try {
            if (this.isConnected && this.client) {
                return await this.client.exists(key) === 1;

            else {
                const item = this.memoryCache.get(key);
                return item ? item.expiry > Date.now() : false;


        catch (error) {
            logger_1.logger.error('Cache exists error:', error);
            return false;


    async flush() {
        try {
            if (this.isConnected && this.client) {
                await this.client.flushAll();
                return true;

            else {
                this.memoryCache.clear();
                return true;


        catch (error) {
            logger_1.logger.error('Cache flush error:', error);
            return false;


    // Cache patterns for common use cases
    async cacheUserData(userId, userData, ttl = 1800) {
        return this.set(`user:${userId}
        return this.get(`user:${userId}
        return this.set(`property:${propertyId}
        return this.get(`property:${propertyId}
        return this.set(`org:${orgId}
        return this.get(`org:${orgId}
        await this.del(`user:${userId}
        await this.del(`property:${propertyId}
        await this.del(`org:${orgId}