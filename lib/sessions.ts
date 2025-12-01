import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

export interface SessionDevice {
  browser: string;
  os: string;
  device: string;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  deviceInfo: SessionDevice;
  ipAddress: string | null;
  location: string | null;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface CreateSessionParams {
  userId: string;
  token: string;
  userAgent: string;
  ipAddress?: string;
  expiresIn: number; // в секундах
}

// Получить лимит сессий по тарифу
export function getSessionLimit(subscriptionPlan: string): number {
  const limits: Record<string, number> = {
    FREE: parseInt(process.env.SESSION_LIMIT_FREE || '2'),
    PRO: parseInt(process.env.SESSION_LIMIT_PRO || '5'),
    SCHOOL: parseInt(process.env.SESSION_LIMIT_SCHOOL || '10'),
  };

  return limits[subscriptionPlan] || limits.FREE;
}

// Хеширование токена для безопасного хранения
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Парсинг User-Agent для получения информации об устройстве
export function parseUserAgent(userAgent: string): SessionDevice {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop',
  };
}

// Создать новую сессию
export async function createSession(params: CreateSessionParams): Promise<Session | null> {
  const { userId, token, userAgent, ipAddress, expiresIn } = params;

  const tokenHash = hashToken(token);
  const deviceInfo = parseUserAgent(userAgent);
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  try {
    const query = `
      INSERT INTO user_sessions (
        user_id, token_hash, device_info, ip_address, expires_at
      ) VALUES (
        '${userId}',
        '${tokenHash}',
        '${JSON.stringify(deviceInfo).replace(/'/g, "''")}',
        ${ipAddress ? `'${ipAddress}'` : 'NULL'},
        '${expiresAt.toISOString()}'
      )
      RETURNING *
    `;

    const result = await executeQuery(query);

    if (!result) return null;

    return {
      id: result.id,
      userId: result.user_id,
      tokenHash: result.token_hash,
      deviceInfo: result.device_info,
      ipAddress: result.ip_address,
      location: result.location,
      createdAt: new Date(result.created_at),
      lastActive: new Date(result.last_active),
      expiresAt: new Date(result.expires_at),
      isActive: result.is_active,
    };
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

// Получить все активные сессии пользователя
export async function getUserSessions(userId: string): Promise<Session[]> {
  try {
    const query = `
      SELECT * FROM user_sessions
      WHERE user_id = '${userId}' AND is_active = true AND expires_at > NOW()
      ORDER BY last_active DESC
    `;

    const result = await executeQueryArray(query);

    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      deviceInfo: row.device_info,
      ipAddress: row.ip_address,
      location: row.location,
      createdAt: new Date(row.created_at),
      lastActive: new Date(row.last_active),
      expiresAt: new Date(row.expires_at),
      isActive: row.is_active,
    }));
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }
}

// Обновить время последней активности сессии
export async function updateSessionActivity(tokenHash: string): Promise<boolean> {
  try {
    const query = `
      UPDATE user_sessions
      SET last_active = NOW()
      WHERE token_hash = '${tokenHash}' AND is_active = true
    `;

    await executeQuery(query);
    return true;
  } catch (error) {
    console.error('Error updating session activity:', error);
    return false;
  }
}

// Удалить сессию по ID
export async function deleteSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false
      WHERE id = '${sessionId}' AND user_id = '${userId}'
    `;

    await executeQuery(query);
    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

// Удалить сессию по token hash
export async function deleteSessionByToken(tokenHash: string): Promise<boolean> {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false
      WHERE token_hash = '${tokenHash}'
    `;

    await executeQuery(query);
    return true;
  } catch (error) {
    console.error('Error deleting session by token:', error);
    return false;
  }
}

// Удалить все сессии пользователя кроме текущей
export async function deleteOtherSessions(userId: string, currentTokenHash: string): Promise<boolean> {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false
      WHERE user_id = '${userId}' AND token_hash != '${currentTokenHash}'
    `;

    await executeQuery(query);
    return true;
  } catch (error) {
    console.error('Error deleting other sessions:', error);
    return false;
  }
}

// Удалить самую старую сессию пользователя
export async function deleteOldestSession(userId: string): Promise<boolean> {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false
      WHERE id = (
        SELECT id FROM user_sessions
        WHERE user_id = '${userId}' AND is_active = true
        ORDER BY last_active ASC
        LIMIT 1
      )
    `;

    await executeQuery(query);
    return true;
  } catch (error) {
    console.error('Error deleting oldest session:', error);
    return false;
  }
}

// Проверить достигнут ли лимит сессий
export async function checkSessionLimit(
  userId: string,
  subscriptionPlan: string
): Promise<{ exceeded: boolean; count: number; limit: number }> {
  const activeSessions = await getUserSessions(userId);
  const limit = getSessionLimit(subscriptionPlan);

  return {
    exceeded: activeSessions.length >= limit,
    count: activeSessions.length,
    limit,
  };
}

// Очистить истекшие сессии (cron job)
export async function cleanExpiredSessions(): Promise<number> {
  try {
    const query = `
      UPDATE user_sessions
      SET is_active = false
      WHERE expires_at < NOW() AND is_active = true
      RETURNING id
    `;

    const result = await executeQueryArray(query);
    return result.length;
  } catch (error) {
    console.error('Error cleaning expired sessions:', error);
    return 0;
  }
}

// Helper функция для выполнения SQL запроса (возвращает одну строку)
async function executeQuery(query: string): Promise<any> {
  const { executeSql } = require('./db-helper');

  try {
    const result = await executeSql(query.replace(/\n/g, ' '), { fieldSeparator: '|' });

    if (!result || result.trim() === '') {
      return null;
    }

    // Парсинг результата
    const lines = result.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    return parsePostgresRowDelimited(lines[0]);
  } catch (error) {
    console.error('Error executing query:', error);
    return null;
  }
}

// Helper функция для выполнения SQL запроса (возвращает массив строк)
async function executeQueryArray(query: string): Promise<any[]> {
  const { executeSql } = require('./db-helper');

  try {
    const result = await executeSql(query.replace(/\n/g, ' '), { fieldSeparator: '|' });

    if (!result || result.trim() === '') {
      return [];
    }

    const lines = result.trim().split('\n').filter(Boolean);
    return lines.map(line => parsePostgresRowDelimited(line));
  } catch (error) {
    console.error('Error executing query array:', error);
    return [];
  }
}

// Парсинг строки PostgreSQL с разделителем |
function parsePostgresRowDelimited(line: string): any {
  const values = line.split('|');

  // Предполагаем порядок колонок: id, user_id, token_hash, device_info, ip_address, location, created_at, last_active, expires_at, is_active
  return {
    id: values[0],
    user_id: values[1],
    token_hash: values[2],
    device_info: JSON.parse(values[3]),
    ip_address: values[4] === '' ? null : values[4],
    location: values[5] === '' ? null : values[5],
    created_at: values[6],
    last_active: values[7],
    expires_at: values[8],
    is_active: values[9] === 't',
  };
}
