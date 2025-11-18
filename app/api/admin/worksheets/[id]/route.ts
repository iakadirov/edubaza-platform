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
  const sql = `SELECT id, phone, name, role FROM users WHERE phone = '${phone}' LIMIT 1`;

  const { stdout } = await execAsync(
    `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql}"`,
    { maxBuffer: 50 * 1024 * 1024 }
  );

  const lines = stdout.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return null;

  const [id, userPhone, name, role] = lines[0].split('|');
  return { id, phone: userPhone, name: name || null, role };
}

async function checkAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
  const user = await findUserByPhone(payload.phone);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return null;
  }

  return user;
}

// DELETE /api/admin/worksheets/[id] - Delete worksheet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdminAccess(request);
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const deleteSql = `DELETE FROM worksheets WHERE id = '${params.id}'`;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${deleteSql}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting worksheet:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при удалении worksheet' },
      { status: 500 }
    );
  }
}
