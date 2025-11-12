/**
 * Redis Client Singleton
 * Управление Redis подключением и операциями
 */

import Redis, { RedisOptions } from 'ioredis';
import { redisConfig } from '@/shared/config/redis.config';

class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    const options: RedisOptions = {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      retryStrategy: redisConfig.retryStrategy,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    };

    this.client = new Redis(options);

    // Event handlers
    this.client.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Redis connection closed');
      this.isConnected = false;
    });
  }

  /**
   * Получить singleton instance
   */
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Получить Redis client
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Проверка соединения
   */
  public async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Set значение с TTL
   */
  public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Get значение
   */
  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Delete ключ
   */
  public async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Проверка существования ключа
   */
  public async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set TTL для существующего ключа
   */
  public async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  /**
   * Получить TTL ключа
   */
  public async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * Increment значение
   */
  public async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * Decrement значение
   */
  public async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  /**
   * Получить множество ключей по паттерну
   */
  public async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Удалить множество ключей по паттерну
   */
  public async deletePattern(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) return 0;
    return await this.client.del(...keys);
  }

  /**
   * Hash операции
   */
  public async hset(key: string, field: string, value: string): Promise<number> {
    return await this.client.hset(key, field, value);
  }

  public async hget(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  public async hgetall(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  public async hdel(key: string, ...fields: string[]): Promise<number> {
    return await this.client.hdel(key, ...fields);
  }

  /**
   * Закрыть соединение
   */
  public async disconnect(): Promise<void> {
    await this.client.quit();
    this.isConnected = false;
  }
}

// Export singleton instance
const redisClient = RedisClient.getInstance();
export default redisClient;

// Export helper functions
export const redis = redisClient.getClient();
export const isRedisHealthy = () => redisClient.isHealthy();
