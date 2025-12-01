import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import { executeSql } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  try {
    // Проверяем токен
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Токен авторизации не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный или истёкший токен' },
        { status: 401 }
      );
    }

    // Получаем пользователя
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем worksheets пользователя
    const sql = `SELECT id, subject, grade, "topicUz", config, status, "generatedAt", "viewCount",
                 jsonb_array_length(tasks) as task_count
                 FROM worksheets
                 WHERE "userId" = '${user.id}'
                 ORDER BY "generatedAt" DESC
                 LIMIT 50;`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });

    // Парсим результаты
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const worksheets = lines.map(line => {
      const parts = line.split('|');
      return {
        id: parts[0],
        subject: parts[1],
        grade: parseInt(parts[2]),
        topicUz: parts[3],
        config: parts[4] ? JSON.parse(parts[4]) : null,
        status: parts[5],
        generatedAt: parts[6],
        viewCount: parseInt(parts[7] || '0'),
        taskCount: parseInt(parts[8] || '0'),
      };
    });

    return NextResponse.json({
      success: true,
      data: worksheets,
    });
  } catch (error) {
    console.error('Get worksheets error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении worksheets',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
