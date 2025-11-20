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

// GET /api/admin/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdminAccess(request);
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const sql = `
      SELECT
        id,
        phone,
        name,
        first_name,
        last_name,
        email,
        role,
        specialty,
        school,
        \\"subscriptionPlan\\",
        \\"subscriptionExpiresAt\\",
        \\"subscriptionStartedAt\\",
        \\"isActive\\",
        \\"createdAt\\",
        \\"lastLoginAt\\",
        (SELECT COUNT(*) FROM worksheets WHERE \\"userId\\" = users.id) as worksheets_count
      FROM users
      WHERE id = '${params.id}'
      LIMIT 1
    `;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ')}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    const lines = stdout.trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const [
      id,
      phone,
      name,
      firstName,
      lastName,
      email,
      role,
      specialty,
      school,
      subscriptionPlan,
      subscriptionExpiresAt,
      subscriptionStartedAt,
      isActive,
      createdAt,
      lastLoginAt,
      worksheetsCount
    ] = lines[0].split('|');

    const user = {
      id,
      phone,
      name: name || null,
      firstName: firstName || null,
      lastName: lastName || null,
      email: email || null,
      role,
      specialty: specialty || null,
      school: school || null,
      subscriptionPlan,
      subscriptionExpiresAt: subscriptionExpiresAt || null,
      subscriptionStartedAt: subscriptionStartedAt || null,
      isActive: isActive === 't',
      createdAt,
      lastLoginAt: lastLoginAt || null,
      worksheetsCount: parseInt(worksheetsCount) || 0,
    };

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при получении профиля пользователя' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdminAccess(request);
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const body = await request.json();
    const { name, firstName, lastName, email, role, specialty, school, subscriptionPlan, isActive } = body;

    // Validate role
    const validRoles = ['STUDENT', 'TEACHER', 'PARENT', 'USER', 'ADMIN', 'SUPER_ADMIN'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Неверная роль' }, { status: 400 });
    }

    // Validate subscription plan against database
    if (subscriptionPlan) {
      const planCheckSql = `SELECT plan_code FROM subscription_plans WHERE plan_code = '${subscriptionPlan}' AND is_active = TRUE LIMIT 1`;
      const { stdout: planCheck } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "${planCheckSql}"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );

      if (!planCheck.trim()) {
        return NextResponse.json({ error: 'Неверный план подписки' }, { status: 400 });
      }
    }

    // Build update query
    const updates = [];
    if (name !== undefined) updates.push(`name = ${name ? `'${name.replace(/'/g, "''")}'` : 'NULL'}`);
    if (firstName !== undefined) updates.push(`first_name = ${firstName ? `'${firstName.replace(/'/g, "''")}'` : 'NULL'}`);
    if (lastName !== undefined) updates.push(`last_name = ${lastName ? `'${lastName.replace(/'/g, "''")}'` : 'NULL'}`);
    if (email !== undefined) updates.push(`email = ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'}`);
    if (role !== undefined) updates.push(`role = '${role}'`);
    if (specialty !== undefined) updates.push(`specialty = ${specialty ? `'${specialty.replace(/'/g, "''")}'` : 'NULL'}`);
    if (school !== undefined) updates.push(`school = ${school ? `'${school.replace(/'/g, "''")}'` : 'NULL'}`);
    if (subscriptionPlan !== undefined) updates.push(`\\"subscriptionPlan\\" = '${subscriptionPlan}'`);
    if (isActive !== undefined) updates.push(`\\"isActive\\" = ${isActive ? 'TRUE' : 'FALSE'}`);

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
    }

    updates.push(`\\"updatedAt\\" = NOW()`);

    const updateSql = `UPDATE users SET ${updates.join(', ')} WHERE id = '${params.id}'`;

    console.log('Update SQL:', updateSql);

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${updateSql}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении пользователя' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdminAccess(request);
    if (!admin) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Prevent deleting yourself
    if (admin.id === params.id) {
      return NextResponse.json({ error: 'Нельзя удалить собственный аккаунт' }, { status: 400 });
    }

    const deleteSql = `DELETE FROM users WHERE id = '${params.id}'`;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${deleteSql}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Ошибка при удалении пользователя' },
      { status: 500 }
    );
  }
}
