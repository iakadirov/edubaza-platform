/**
 * Redis Configuration
 */

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || '',
  db: parseInt(process.env.REDIS_DB || '0'),

  // Connection options
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  // Key prefixes
  prefixes: {
    session: 'session:',
    otp: 'otp:',
    cache: 'cache:',
    queue: 'queue:',
  },

  // TTL settings (in seconds)
  ttl: {
    otp: 300, // 5 minutes
    session: 2592000, // 30 days
    cache: 3600, // 1 hour
  },
} as const;

export type RedisConfig = typeof redisConfig;
