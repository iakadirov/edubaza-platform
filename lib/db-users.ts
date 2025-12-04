// Temporary DB helper for users until Prisma works
// Uses direct SQL via docker exec for Windows compatibility

import { exec } from 'child_process';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import { executeSql } from './db-helper';

const execAsync = promisify(exec);

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

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  passwordHash: string | null;
  specialty: TeacherSpecialty | null;
  school: string | null;
  subscriptionPlan: 'FREE' | 'PRO' | 'SCHOOL';
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  try {
    const sql = `SELECT * FROM users WHERE phone = '${phone}' LIMIT 1;`;
    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    const parts = stdout.trim().split('|');
    // Порядок: id|phone|name|email|subscriptionPlan|subscriptionExpiresAt|subscriptionStartedAt|limits|usage|createdAt|updatedAt|lastLoginAt|isActive|specialty|school|role|password_hash
    const [id, phoneNum, name, email, subscriptionPlan, , , , , createdAt, updatedAt, , , specialty, school, role, passwordHash] = parts;

    return {
      id,
      phone: phoneNum,
      name: name || null,
      email: email || null,
      passwordHash: passwordHash || null,
      specialty: (specialty || null) as TeacherSpecialty | null,
      school: school || null,
      subscriptionPlan: subscriptionPlan as 'FREE' | 'PRO' | 'SCHOOL',
      role: (role || 'USER') as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    };
  } catch (error) {
    console.error('Find user error:', error);
    return null;
  }
}

export async function createUser(phone: string): Promise<User | null> {
  try {
    // Генерируем UUID для id (используем gen_random_uuid() PostgreSQL)
    const sql = `INSERT INTO users (id, phone, \\"subscriptionPlan\\", \\"createdAt\\", \\"updatedAt\\") VALUES (gen_random_uuid()::text, '${phone}', 'FREE', NOW(), NOW()) RETURNING *;`;

    const { stdout } = await execAsync(
      `PGPASSWORD='${process.env.DATABASE_PASSWORD || '9KOcIWiykfNXVZryDSfjnHk2ungrXkzIFkwU'}' psql -h localhost -U edubaza -d edubaza -t -A -F"|" -c "${sql}"`
    );

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    const parts = stdout.trim().split('|');
    // Порядок: id|phone|name|email|subscriptionPlan|subscriptionExpiresAt|subscriptionStartedAt|limits|usage|createdAt|updatedAt|lastLoginAt|isActive|specialty|school|role|password_hash
    const [id, phoneNum, name, email, subscriptionPlan, , , , , createdAt, updatedAt, , , specialty, school, role, passwordHash] = parts;

    return {
      id,
      phone: phoneNum,
      name: name || null,
      email: email || null,
      passwordHash: passwordHash || null,
      specialty: (specialty || null) as TeacherSpecialty | null,
      school: school || null,
      subscriptionPlan: subscriptionPlan as 'FREE' | 'PRO' | 'SCHOOL',
      role: (role || 'USER') as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    };
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
}

export async function updateUserProfile(
  phone: string,
  updates: {
    name?: string;
    specialty?: TeacherSpecialty | null;
    school?: string | null;
  }
): Promise<User | null> {
  try {
    const setParts: string[] = [];

    if (updates.name !== undefined) {
      setParts.push(`name = '${updates.name.replace(/'/g, "''")}'`);
    }
    if (updates.specialty !== undefined) {
      setParts.push(updates.specialty ? `specialty = '${updates.specialty}'::\\"TeacherSpecialty\\"` : `specialty = NULL`);
    }
    if (updates.school !== undefined) {
      setParts.push(updates.school ? `school = '${updates.school.replace(/'/g, "''")}'` : `school = NULL`);
    }

    if (setParts.length === 0) {
      return findUserByPhone(phone);
    }

    const sql = `UPDATE users SET ${setParts.join(', ')}, \\"updatedAt\\" = NOW() WHERE phone = '${phone}' RETURNING *;`;

    const { stdout } = await execAsync(
      `PGPASSWORD='${process.env.DATABASE_PASSWORD || '9KOcIWiykfNXVZryDSfjnHk2ungrXkzIFkwU'}' psql -h localhost -U edubaza -d edubaza -t -A -F"|" -c "${sql}"`
    );

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    const parts = stdout.trim().split('|');
    // Порядок: id|phone|name|email|subscriptionPlan|subscriptionExpiresAt|subscriptionStartedAt|limits|usage|createdAt|updatedAt|lastLoginAt|isActive|specialty|school|role|password_hash
    const [id, phoneNum, name, email, subscriptionPlan, , , , , createdAt, updatedAt, , , specialty, school, role, passwordHash] = parts;

    return {
      id,
      phone: phoneNum,
      name: name || null,
      email: email || null,
      passwordHash: passwordHash || null,
      specialty: (specialty || null) as TeacherSpecialty | null,
      school: school || null,
      subscriptionPlan: subscriptionPlan as 'FREE' | 'PRO' | 'SCHOOL',
      role: (role || 'USER') as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    };
  } catch (error) {
    console.error('Update user profile error:', error);
    return null;
  }
}

export async function findOrCreateUser(phone: string): Promise<User | null> {
  let user = await findUserByPhone(phone);

  if (!user) {
    user = await createUser(phone);
  }

  return user;
}

// Helper function to check if user is admin
export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUserWithPassword(phone: string, password: string): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password);
    const escapedHash = passwordHash.replace(/'/g, "''");

    const sql = `INSERT INTO users (id, phone, password_hash, \\"subscriptionPlan\\", \\"createdAt\\", \\"updatedAt\\") VALUES (gen_random_uuid()::text, '${phone}', '${escapedHash}', 'FREE', NOW(), NOW()) RETURNING *;`;

    const { stdout } = await execAsync(
      `PGPASSWORD='${process.env.DATABASE_PASSWORD || '9KOcIWiykfNXVZryDSfjnHk2ungrXkzIFkwU'}' psql -h localhost -U edubaza -d edubaza -t -A -F"|" -c "${sql}"`
    );

    if (!stdout || stdout.trim() === '') {
      return null;
    }

    return findUserByPhone(phone);
  } catch (error) {
    console.error('Create user with password error:', error);
    return null;
  }
}

export async function updateUserPassword(phone: string, newPassword: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPassword);
    const escapedHash = passwordHash.replace(/'/g, "''");

    const sql = `UPDATE users SET password_hash = '${escapedHash}', \\"updatedAt\\" = NOW() WHERE phone = '${phone}';`;

    await execAsync(
      `PGPASSWORD='${process.env.DATABASE_PASSWORD || '9KOcIWiykfNXVZryDSfjnHk2ungrXkzIFkwU'}' psql -h localhost -U edubaza -d edubaza -c "${sql}"`
    );

    return true;
  } catch (error) {
    console.error('Update user password error:', error);
    return false;
  }
}
