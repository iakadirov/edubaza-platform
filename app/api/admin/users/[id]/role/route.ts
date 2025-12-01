import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeSql } from '@/lib/db-helper';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  phone: string;
}

async function findUserByPhone(phone: string) {
  const escapedPhone = phone.replace(/'/g, "''");
  const sql = `SELECT id, phone, "fullName", role FROM users WHERE phone = '${escapedPhone}' LIMIT 1`;

  const stdout = await executeSql(sql.replace(/\n/g, ' '), { fieldSeparator: '|' });

  const lines = stdout.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return null;

  const [id, userPhone, fullName, role] = lines[0].split('|');
  return { id, phone: userPhone, fullName: fullName || null, role };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Check if user is admin
    const user = await findUserByPhone(payload.phone);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Неверная роль' }, { status: 400 });
    }

    // Update user role
    const escapedUserId = params.id.replace(/'/g, "''");
    const escapedRole = role.replace(/'/g, "''");
    const updateSql = `UPDATE users SET role = '${escapedRole}' WHERE id = '${escapedUserId}'`;

    await executeSql(updateSql);

    return NextResponse.json({ success: true, message: 'Роль обновлена' });
  } catch (error: any) {
    console.error('Error updating user role:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении роли' },
      { status: 500 }
    );
  }
}
