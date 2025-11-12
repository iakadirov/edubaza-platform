/**
 * Cache Service
 * Высокоуровневый сервис для работы с кешем
 */

import redisClient from './redis.client';
import { redisConfig } from '@/shared/config/redis.config';

export class CacheService {
  /**
   * Сохранить в кеш с префиксом
   */
  static async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = redisConfig.ttl.cache
  ): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    const serialized = JSON.stringify(value);
    await redisClient.set(prefixedKey, serialized, ttlSeconds);
  }

  /**
   * Получить из кеша
   */
  static async get<T>(key: string): Promise<T | null> {
    const prefixedKey = this.getPrefixedKey(key);
    const value = await redisClient.get(prefixedKey);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache parse error:', error);
      return null;
    }
  }

  /**
   * Удалить из кеша
   */
  static async delete(key: string): Promise<void> {
    const prefixedKey = this.getPrefixedKey(key);
    await redisClient.del(prefixedKey);
  }

  /**
   * Проверить существование в кеше
   */
  static async exists(key: string): Promise<boolean> {
    const prefixedKey = this.getPrefixedKey(key);
    return await redisClient.exists(prefixedKey);
  }

  /**
   * Удалить множество ключей по паттерну
   */
  static async deletePattern(pattern: string): Promise<number> {
    const prefixedPattern = this.getPrefixedKey(pattern);
    return await redisClient.deletePattern(prefixedPattern);
  }

  /**
   * Remember pattern - получить из кеша или выполнить callback
   */
  static async remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => Promise<T>
  ): Promise<T> {
    // Попытка получить из кеша
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Выполнить callback и сохранить в кеш
    const value = await callback();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Добавить префикс к ключу
   */
  private static getPrefixedKey(key: string): string {
    return `${redisConfig.prefixes.cache}${key}`;
  }
}

export default CacheService;
