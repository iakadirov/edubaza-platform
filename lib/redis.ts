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
