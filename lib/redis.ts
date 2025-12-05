import Redis from 'ioredis';

// Singleton Redis instance
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redis;
}

// OTP хранение и получение
export async function saveOTP(phone: string, otp: string): Promise<void> {
  const client = getRedisClient();
  const key = `otp:${phone}`;
  // OTP действителен 5 минут
  await client.setex(key, 300, otp);
}

export async function getOTP(phone: string): Promise<string | null> {
  const client = getRedisClient();
  const key = `otp:${phone}`;
  return await client.get(key);
}

export async function deleteOTP(phone: string): Promise<void> {
  const client = getRedisClient();
  const key = `otp:${phone}`;
  await client.del(key);
}

// Проверка и удаление OTP
export async function verifyOTP(phone: string, otp: string, deleteAfterVerify: boolean = true): Promise<boolean> {
  const storedOTP = await getOTP(phone);

  if (!storedOTP) {
    return false; // OTP не найден или истек
  }

  if (storedOTP !== otp) {
    return false; // OTP не совпадает
  }

  // OTP корректный - удаляем его только если требуется
  if (deleteAfterVerify) {
    await deleteOTP(phone);
  }
  return true;
}

// Rate limiting для предотвращения спама
export async function checkRateLimit(phone: string): Promise<boolean> {
  const client = getRedisClient();
  const key = `rate:${phone}`;
  const count = await client.get(key);

  if (count && parseInt(count) >= 3) {
    return false; // Превышен лимит (3 попытки в 15 минут)
  }

  return true;
}

export async function incrementRateLimit(phone: string): Promise<void> {
  const client = getRedisClient();
  const key = `rate:${phone}`;
  const current = await client.get(key);

  if (current) {
    await client.incr(key);
  } else {
    await client.setex(key, 900, '1'); // 15 минут
  }
}

/**
 * ОПТИМИЗИРОВАННАЯ ВЕРСИЯ: Проверка и инкремент rate limit за одну операцию
 * Использует Redis INCR + EXPIRE для атомарной операции
 *
 * @param phone - номер телефона
 * @param maxAttempts - максимальное количество попыток (по умолчанию 3)
 * @param ttlSeconds - время жизни счётчика в секундах (по умолчанию 900 = 15 минут)
 * @returns true если можно отправить SMS, false если превышен лимит
 */
export async function checkAndIncrementRateLimit(
  phone: string,
  maxAttempts: number = 3,
  ttlSeconds: number = 900
): Promise<{ allowed: boolean; attemptsLeft: number; resetAt: number }> {
  const client = getRedisClient();
  const key = `rate:${phone}`;

  // Используем Redis pipeline для атомарности
  const pipeline = client.pipeline();
  pipeline.incr(key);
  pipeline.ttl(key);
  pipeline.get(key);

  const results = await pipeline.exec();

  if (!results) {
    return { allowed: false, attemptsLeft: 0, resetAt: Date.now() + ttlSeconds * 1000 };
  }

  const newCount = results[0]?.[1] as number;
  const currentTtl = results[1]?.[1] as number;

  // Если TTL = -1, значит ключ не имеет expiry - устанавливаем
  if (currentTtl === -1) {
    await client.expire(key, ttlSeconds);
  }

  const resetAt = Date.now() + (currentTtl > 0 ? currentTtl * 1000 : ttlSeconds * 1000);
  const attemptsLeft = Math.max(0, maxAttempts - newCount);
  const allowed = newCount <= maxAttempts;

  return {
    allowed,
    attemptsLeft,
    resetAt,
  };
}

/**
 * Сбросить rate limit для номера телефона
 * @param phone - номер телефона
 */
export async function resetRateLimit(phone: string): Promise<void> {
  const client = getRedisClient();
  const key = `rate:${phone}`;
  await client.del(key);
}

/**
 * Получить информацию о текущем rate limit
 * @param phone - номер телефона
 * @returns информация о лимите
 */
export async function getRateLimitInfo(phone: string): Promise<{
  attempts: number;
  ttl: number;
  resetAt: number;
}> {
  const client = getRedisClient();
  const key = `rate:${phone}`;

  const pipeline = client.pipeline();
  pipeline.get(key);
  pipeline.ttl(key);

  const results = await pipeline.exec();

  const attempts = parseInt((results?.[0]?.[1] as string) || '0');
  const ttl = (results?.[1]?.[1] as number) || 0;
  const resetAt = ttl > 0 ? Date.now() + ttl * 1000 : 0;

  return { attempts, ttl, resetAt };
}
