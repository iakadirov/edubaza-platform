/**
 * Crypto Utilities
 * Функции для шифрования и хеширования
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Хеширование пароля
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Проверка пароля
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Генерация случайного OTP кода
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
}

/**
 * Генерация случайной строки
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Генерация безопасного токена
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * MD5 хеш (для подписей платежей)
 */
export function md5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * SHA256 хеш
 */
export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * HMAC подпись
 */
export function hmacSign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Проверка HMAC подписи
 */
export function verifyHmac(data: string, signature: string, secret: string): boolean {
  const expectedSignature = hmacSign(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
