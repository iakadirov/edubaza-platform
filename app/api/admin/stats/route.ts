import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

const execAsync = promisify(exec);
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface JWTPayload {
  userId: string;
  phone: string;
  role: string;
}

async function findUserByPhone(phone: string) {
  const sql = `SELECT id, phone, name, role FROM users WHERE phone = '${phone}' LIMIT 1`;

  try {
    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql}"`,
      { maxBuffer: 50 * 1024 * 1024 }
    );

    const lines = stdout.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return null;

    const [id, userPhone, name, role] = lines[0].split('|');
    return { id, phone: userPhone, name, role };
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let payload: JWTPayload;

    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    // Check if user is admin
    const user = await findUserByPhone(payload.phone);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    // Get statistics
    const stats = {
      grades: 0,
      subjects: 0,
      topics: 0,
      materials: 0,
      users: 0,
      teachers: 0,
      students: 0,
    };

    // Count grades (1-12)
    stats.grades = 12;

    // Count subjects (COALESCE handles NULL as TRUE)
    try {
      const { stdout: subjectsOut } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "SELECT COUNT(*) FROM subjects WHERE COALESCE(is_visible, TRUE) = TRUE"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      console.log('Subjects stdout:', subjectsOut);
      stats.subjects = parseInt(subjectsOut.trim()) || 0;
      console.log('Subjects count:', stats.subjects);
    } catch (error) {
      console.error('Error counting subjects:', error);
    }

    // Count topics (COALESCE handles NULL as TRUE)
    try {
      const { stdout: topicsOut } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "SELECT COUNT(*) FROM topics WHERE COALESCE(is_visible, TRUE) = TRUE"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      console.log('Topics stdout:', topicsOut);
      stats.topics = parseInt(topicsOut.trim()) || 0;
      console.log('Topics count:', stats.topics);
    } catch (error) {
      console.error('Error counting topics:', error);
    }

    // Count materials (predefined tasks)
    try {
      const { stdout: materialsOut } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "SELECT COUNT(*) FROM predefined_tasks"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      stats.materials = parseInt(materialsOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting materials:', error);
    }

    // Count users
    try {
      const { stdout: usersOut } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "SELECT COUNT(*) FROM users"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      stats.users = parseInt(usersOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting users:', error);
    }

    // Count teachers (users with specialty field set)
    try {
      const { stdout: teachersOut } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "SELECT COUNT(*) FROM users WHERE specialty IS NOT NULL"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      stats.teachers = parseInt(teachersOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting teachers:', error);
    }

    // Count students (regular users without specialty and without admin role)
    try {
      const { stdout: studentsOut } = await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "SELECT COUNT(*) FROM users WHERE specialty IS NULL AND role = 'USER'"`,
        { maxBuffer: 50 * 1024 * 1024 }
      );
      stats.students = parseInt(studentsOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting students:', error);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    );
  }
}
