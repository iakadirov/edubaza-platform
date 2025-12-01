import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeSql } from '@/lib/db-helper';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface JWTPayload {
  phone: string;
}

async function findUserByPhone(phone: string) {
  const escapedPhone = phone.replace(/'/g, "''");
  const sql = `SELECT id, phone, name, role FROM users WHERE phone = '${escapedPhone}' LIMIT 1`;

  const stdout = await executeSql(sql, { fieldSeparator: '|' });

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

// GET /api/admin/users/[id]/worksheets - Get user's worksheets
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdminAccess(request);
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const escapedId = params.id.replace(/'/g, "''");
    const sql = `
      SELECT
        id,
        "topicUz" as title,
        grade,
        subject,
        "generatedAt" as created_at,
        (SELECT COUNT(*) FROM jsonb_array_elements(tasks) WHERE value->>'type' IS NOT NULL) as tasks_count
      FROM worksheets
      WHERE "userId" = '${escapedId}'
      ORDER BY "generatedAt" DESC
    `;

    const stdout = await executeSql(sql.replace(/\n/g, ' '), { fieldSeparator: '|' });

    const lines = stdout.trim().split('\n').filter(Boolean);
    const worksheets = lines.map(line => {
      const [id, title, grade, subject, createdAt, tasksCount] = line.split('|');
      return {
        id,
        title,
        grade: parseInt(grade),
        subject,
        createdAt,
        tasksCount: parseInt(tasksCount) || 0,
      };
    });

    return NextResponse.json({ worksheets });
  } catch (error: any) {
    console.error('Error fetching worksheets:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при получении рабочих листов' },
      { status: 500 }
    );
  }
}
