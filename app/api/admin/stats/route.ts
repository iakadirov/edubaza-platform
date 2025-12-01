import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeSql } from '@/lib/db-helper';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface JWTPayload {
  userId: string;
  phone: string;
  role: string;
}

async function findUserByPhone(phone: string) {
  const sql = `SELECT id, phone, name, role FROM users WHERE phone = '${phone}' LIMIT 1`;

  try {
    const stdout = await executeSql(sql, { fieldSeparator: '|' });

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
      const subjectsOut = await executeSql(
        "SELECT COUNT(*) FROM subjects WHERE COALESCE(is_visible, TRUE) = TRUE"
      );
      console.log('Subjects stdout:', subjectsOut);
      stats.subjects = parseInt(subjectsOut.trim()) || 0;
      console.log('Subjects count:', stats.subjects);
    } catch (error) {
      console.error('Error counting subjects:', error);
    }

    // Count topics (COALESCE handles NULL as TRUE)
    try {
      const topicsOut = await executeSql(
        "SELECT COUNT(*) FROM topics WHERE COALESCE(is_visible, TRUE) = TRUE"
      );
      console.log('Topics stdout:', topicsOut);
      stats.topics = parseInt(topicsOut.trim()) || 0;
      console.log('Topics count:', stats.topics);
    } catch (error) {
      console.error('Error counting topics:', error);
    }

    // Count materials (predefined tasks)
    try {
      const materialsOut = await executeSql("SELECT COUNT(*) FROM predefined_tasks");
      stats.materials = parseInt(materialsOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting materials:', error);
    }

    // Count users
    try {
      const usersOut = await executeSql("SELECT COUNT(*) FROM users");
      stats.users = parseInt(usersOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting users:', error);
    }

    // Count teachers (users with specialty field set)
    try {
      const teachersOut = await executeSql("SELECT COUNT(*) FROM users WHERE specialty IS NOT NULL");
      stats.teachers = parseInt(teachersOut.trim()) || 0;
    } catch (error) {
      console.error('Error counting teachers:', error);
    }

    // Count students (regular users without specialty and without admin role)
    try {
      const studentsOut = await executeSql("SELECT COUNT(*) FROM users WHERE specialty IS NULL AND role = 'USER'");
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
