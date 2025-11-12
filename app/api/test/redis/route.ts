import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export async function GET() {
  let redis: Redis | null = null;

  try {
    // Create Redis client
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Test connection
    await redis.ping();

    // Set a test key
    const testKey = 'test:connection';
    const testValue = `Connection test at ${new Date().toISOString()}`;
    await redis.set(testKey, testValue, 'EX', 10); // Expires in 10 seconds

    // Get the test key
    const retrievedValue = await redis.get(testKey);

    // Get Redis info
    const info = await redis.info('server');
    const redisVersion = info.match(/redis_version:([^\r\n]+)/)?.[1] || 'unknown';

    await redis.quit();

    return NextResponse.json({
      success: true,
      message: 'Redis connection successful! ✅',
      data: {
        redisVersion,
        testKeySet: testValue,
        testKeyRetrieved: retrievedValue,
        connected: true,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Redis connection error:', error);

    if (redis) {
      await redis.quit();
    }

    return NextResponse.json({
      success: false,
      message: 'Redis connection failed ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
