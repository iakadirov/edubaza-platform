// Extended DB helper for users with password support and new fields
// Uses executeSql from db-helper for consistent database access

import bcrypt from 'bcryptjs';
import { executeSql } from './db-helper';

export type TeacherSpecialty =
  | 'PRIMARY_SCHOOL'
  | 'MATHEMATICS'
  | 'RUSSIAN_LANGUAGE'
  | 'UZBEK_LANGUAGE'
  | 'ENGLISH_LANGUAGE'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'GEOGRAPHY'
  | 'HISTORY'
  | 'LITERATURE'
  | 'INFORMATICS'
  | 'PHYSICAL_EDUCATION'
  | 'MUSIC'
  | 'ART'
  | 'OTHER';

export type UserRole = 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN' | 'SUPER_ADMIN' | 'USER';

export interface User {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null; // deprecated, use firstName + lastName
  email: string | null;
  role: UserRole;
  specialty: TeacherSpecialty | null;
  school: string | null;
  subscriptionPlan: 'FREE' | 'PRO' | 'SCHOOL';
  telegramId: string | null;
  telegramUsername: string | null;
  telegramPhotoUrl: string | null;
  hasPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface CreateUserParams {
  phone: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  password?: string;
  telegramId?: string;
  telegramUsername?: string;
  telegramPhotoUrl?: string;
  specialty?: TeacherSpecialty;
  school?: string;
}

// Хеширование пароля
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Проверка пароля
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Найти пользователя по телефону
export async function findUserByPhone(phone: string): Promise<User | null> {
  try {
    const escapedPhone = phone.replace(/'/g, "''");
    const sql = `SELECT * FROM users WHERE phone = '${escapedPhone}' LIMIT 1;`;
    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    return parseUser(stdout.trim());
  } catch (error) {
    console.error('Find user by phone error:', error);
    return null;
  }
}

// Найти пользователя по Telegram ID
export async function findUserByTelegramId(telegramId: string): Promise<User | null> {
  try {
    const escapedTelegramId = telegramId.replace(/'/g, "''");
    const sql = `SELECT * FROM users WHERE telegram_id = '${escapedTelegramId}' LIMIT 1;`;
    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    return parseUser(stdout.trim());
  } catch (error) {
    console.error('Find user by telegram error:', error);
    return null;
  }
}

// Найти пользователя по ID
export async function findUserById(id: string): Promise<User | null> {
  try {
    const escapedId = id.replace(/'/g, "''");
    const sql = `SELECT * FROM users WHERE id = '${escapedId}' LIMIT 1;`;
    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    return parseUser(stdout.trim());
  } catch (error) {
    console.error('Find user by id error:', error);
    return null;
  }
}

// Создать пользователя
export async function createUserExtended(params: CreateUserParams): Promise<User | null> {
  try {
    const {
      phone,
      firstName,
      lastName,
      role = 'STUDENT',
      password,
      telegramId,
      telegramUsername,
      telegramPhotoUrl,
      specialty,
      school,
    } = params;

    const passwordHash = password ? await hashPassword(password) : null;

    // Определяем тариф: для учителей PRO (бесплатно), для остальных FREE
    const subscriptionPlan = role === 'TEACHER' ? 'PRO' : 'FREE';

    const escapedPhone = phone.replace(/'/g, "''");
    const fields = ['id', 'phone', 'role', '\\"subscriptionPlan\\"', '\\"createdAt\\"', '\\"updatedAt\\"'];
    const values = [
      'gen_random_uuid()::text',
      `'${escapedPhone}'`,
      `'${role}'::user_role`,
      `'${subscriptionPlan}'::\\"SubscriptionPlan\\"`,
      'NOW()',
      'NOW()',
    ];

    if (firstName) {
      fields.push('first_name');
      values.push(`'${firstName.replace(/'/g, "''")}'`);
    }

    if (lastName) {
      fields.push('last_name');
      values.push(`'${lastName.replace(/'/g, "''")}'`);
    }

    if (passwordHash) {
      fields.push('password_hash');
      // No need to escape $ when using executeSql with stdin
      values.push(`'${passwordHash}'`);
    }

    if (telegramId) {
      fields.push('telegram_id');
      const escapedTelegramId = telegramId.replace(/'/g, "''");
      values.push(`'${escapedTelegramId}'`);
    }

    if (telegramUsername) {
      fields.push('telegram_username');
      const escapedTelegramUsername = telegramUsername.replace(/'/g, "''");
      values.push(`'${escapedTelegramUsername}'`);
    }

    if (telegramPhotoUrl) {
      fields.push('telegram_photo_url');
      const escapedTelegramPhotoUrl = telegramPhotoUrl.replace(/'/g, "''");
      values.push(`'${escapedTelegramPhotoUrl}'`);
    }

    if (specialty) {
      fields.push('specialty');
      values.push(`'${specialty}'::\\"TeacherSpecialty\\"`);
    }

    if (school) {
      fields.push('school');
      values.push(`'${school.replace(/'/g, "''")}'`);
    }

    const sql = `INSERT INTO users (${fields.join(', ')}) VALUES (${values.join(', ')}) RETURNING *;`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    return parseUser(stdout.trim());
  } catch (error) {
    console.error('Create user extended error:', error);
    return null;
  }
}

// Обновить профиль пользователя
export async function updateUserProfileExtended(
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    name?: string;
    specialty?: TeacherSpecialty | null;
    school?: string | null;
    telegramId?: string;
    telegramUsername?: string;
    telegramPhotoUrl?: string;
  }
): Promise<User | null> {
  try {
    const setParts: string[] = [];

    if (updates.firstName !== undefined) {
      setParts.push(`first_name = '${updates.firstName.replace(/'/g, "''")}'`);
    }

    if (updates.lastName !== undefined) {
      setParts.push(`last_name = '${updates.lastName.replace(/'/g, "''")}'`);
    }

    if (updates.name !== undefined) {
      setParts.push(`name = '${updates.name.replace(/'/g, "''")}'`);
    }

    if (updates.specialty !== undefined) {
      setParts.push(updates.specialty ? `specialty = '${updates.specialty}'::\\"TeacherSpecialty\\"` : `specialty = NULL`);
    }

    if (updates.school !== undefined) {
      setParts.push(updates.school ? `school = '${updates.school.replace(/'/g, "''")}'` : `school = NULL`);
    }

    if (updates.telegramId !== undefined) {
      const escapedTelegramId = updates.telegramId.replace(/'/g, "''");
      setParts.push(`telegram_id = '${escapedTelegramId}'`);
    }

    if (updates.telegramUsername !== undefined) {
      const escapedTelegramUsername = updates.telegramUsername.replace(/'/g, "''");
      setParts.push(`telegram_username = '${escapedTelegramUsername}'`);
    }

    if (updates.telegramPhotoUrl !== undefined) {
      const escapedTelegramPhotoUrl = updates.telegramPhotoUrl.replace(/'/g, "''");
      setParts.push(`telegram_photo_url = '${escapedTelegramPhotoUrl}'`);
    }

    if (setParts.length === 0) {
      return findUserById(userId);
    }

    const escapedUserId = userId.replace(/'/g, "''");
    const sql = `UPDATE users SET ${setParts.join(', ')}, \\"updatedAt\\" = NOW() WHERE id = '${escapedUserId}' RETURNING *;`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    return parseUser(stdout.trim());
  } catch (error) {
    console.error('Update user profile extended error:', error);
    return null;
  }
}

// Установить пароль
export async function setUserPassword(userId: string, password: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(password);
    const escapedUserId = userId.replace(/'/g, "''");

    // No need to escape $ when using executeSql with stdin
    const sql = `UPDATE users SET password_hash = '${passwordHash}', "updatedAt" = NOW() WHERE id = '${escapedUserId}';`;

    await executeSql(sql);

    return true;
  } catch (error) {
    console.error('Set user password error:', error);
    return false;
  }
}

// Проверить пароль пользователя
export async function checkUserPassword(phone: string, password: string): Promise<User | null> {
  try {
    const escapedPhone = phone.replace(/'/g, "''");
    const sql = `SELECT * FROM users WHERE phone = '${escapedPhone}' LIMIT 1;`;
    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    const user = parseUser(stdout.trim());
    if (!user) return null;

    // Получить password_hash отдельно
    const escapedUserId = user.id.replace(/'/g, "''");
    const hashSql = `SELECT password_hash FROM users WHERE id = '${escapedUserId}';`;
    const hashStdout = await executeSql(hashSql);

    const passwordHash = hashStdout.trim();

    if (!passwordHash || passwordHash === '') {
      return null; // Пароль не установлен
    }

    const isValid = await verifyPassword(password, passwordHash);
    return isValid ? user : null;
  } catch (error) {
    console.error('Check user password error:', error);
    return null;
  }
}

/**
 * ОПТИМИЗИРОВАННАЯ ВЕРСИЯ: Проверить пароль пользователя
 * Выполняет проверку в ОДНОМ SQL-запросе вместо двух
 *
 * @param phone - номер телефона
 * @param password - пароль для проверки
 * @returns пользователь если пароль верный, иначе null
 */
export async function checkUserPasswordOptimized(phone: string, password: string): Promise<User | null> {
  try {
    const escapedPhone = phone.replace(/'/g, "''");

    // Один запрос для получения пользователя И password_hash
    const sql = `
      SELECT
        id, phone, name, email, "subscriptionPlan", "subscriptionExpiresAt", "subscriptionStartedAt",
        limits, usage, "createdAt", "updatedAt", "lastLoginAt", "isActive", specialty, school,
        role, first_name, last_name, telegram_id, telegram_username, telegram_photo_url,
        password_hash
      FROM users
      WHERE phone = '${escapedPhone}'
      LIMIT 1;
    `;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    // Разбираем результат
    const parts = stdout.trim().split('|');

    if (parts.length < 22) {
      console.error('Unexpected number of columns in checkUserPasswordOptimized');
      return null;
    }

    const passwordHash = parts[21]; // password_hash - последняя колонка

    if (!passwordHash || passwordHash === '') {
      return null; // Пароль не установлен
    }

    // Проверяем пароль
    const isValid = await verifyPassword(password, passwordHash);

    if (!isValid) {
      return null;
    }

    // Парсим пользователя (используем первые 21 колонку, без password_hash)
    const userRow = parts.slice(0, 21).join('|');
    return parseUser(userRow);
  } catch (error) {
    console.error('Check user password optimized error:', error);
    return null;
  }
}

// Обновить время последнего входа
export async function updateLastLogin(userId: string): Promise<boolean> {
  try {
    const escapedUserId = userId.replace(/'/g, "''");
    const sql = `UPDATE users SET \\"lastLoginAt\\" = NOW() WHERE id = '${escapedUserId}';`;
    await executeSql(sql);
    return true;
  } catch (error) {
    console.error('Update last login error:', error);
    return false;
  }
}

// Helper function to parse user from database row
function parseUser(row: string): User | null {
  try {
    const parts = row.split('|');
    // Порядок колонок из базы (после всех ALTER TABLE):
    // id|phone|name|email|subscriptionPlan|subscriptionExpiresAt|subscriptionStartedAt|limits|usage|
    // createdAt|updatedAt|lastLoginAt|isActive|specialty|school|role|password_hash|first_name|last_name|
    // telegram_id|telegram_username|telegram_photo_url

    const [
      id,
      phone,
      name,
      email,
      subscriptionPlan,
      ,
      ,
      ,
      ,
      createdAt,
      updatedAt,
      lastLoginAt,
      ,
      specialty,
      school,
      role,
      passwordHash,
      firstName,
      lastName,
      telegramId,
      telegramUsername,
      telegramPhotoUrl,
    ] = parts;

    return {
      id,
      phone,
      firstName: firstName || null,
      lastName: lastName || null,
      name: name || null,
      email: email || null,
      role: (role || 'STUDENT') as UserRole,
      specialty: (specialty || null) as TeacherSpecialty | null,
      school: school || null,
      subscriptionPlan: subscriptionPlan as 'FREE' | 'PRO' | 'SCHOOL',
      telegramId: telegramId || null,
      telegramUsername: telegramUsername || null,
      telegramPhotoUrl: telegramPhotoUrl || null,
      hasPassword: !!passwordHash && passwordHash !== '',
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      lastLoginAt: lastLoginAt ? new Date(lastLoginAt) : null,
    };
  } catch (error) {
    console.error('Parse user error:', error);
    return null;
  }
}

// Helper function to check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

// Helper function to check if user is teacher
export function isTeacher(user: User | null): boolean {
  return user?.role === 'TEACHER';
}

// Helper function to check if user is student
export function isStudent(user: User | null): boolean {
  return user?.role === 'STUDENT';
}

// Helper function to check if user is parent
export function isParent(user: User | null): boolean {
  return user?.role === 'PARENT';
}
