import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  phone: string;
}

async function findUserByPhone(phone: string) {
  const sql = `SELECT id, phone, name, role, \\"createdAt\\" FROM users WHERE phone = '${phone}' LIMIT 1`;

  const { stdout } = await execAsync(
    `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ')}"`,
    { maxBuffer: 50 * 1024 * 1024 }
  );

  const lines = stdout.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return null;

  const [id, userPhone, name, role, createdAt] = lines[0].split('|');
  return { id, phone: userPhone, name: name || null, role, createdAt };
}

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;

    console.log('Finding user by phone:', payload.phone);

    // Check if user is admin
    const user = await findUserByPhone(payload.phone);
    console.log('Found user:', user);

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Fetch all users
    const sql = `
      SELECT
        id,
        phone,
        name,
        role,
        \\"createdAt\\"
      FROM users
      ORDER BY \\"createdAt\\" DESC
    `;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ')}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    const lines = stdout.trim().split('\n').filter(Boolean);
    const users = lines.map(line => {
      const [id, phone, name, role, createdAt] = line.split('|');
      return {
        id,
        phone,
        name: name || null,
        role,
        createdAt,
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    );
  }
}
