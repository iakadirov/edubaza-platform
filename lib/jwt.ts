import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  phone: string;
  role?: string;
  subscriptionPlan: 'FREE' | 'PRO' | 'SCHOOL' | 'BEMINNAT';
}

/**
 * Генерирует JWT токен
 * @param payload - данные для токена
 * @param expiresIn - срок действия токена (например: '24h', '30d')
 * @returns JWT токен
 */
export function generateToken(payload: JWTPayload, expiresIn?: string): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn || JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
