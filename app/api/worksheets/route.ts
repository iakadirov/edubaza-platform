import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';

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

    // Получаем worksheets пользователя через docker exec
    const { spawn } = require('child_process');

    const worksheets = await new Promise<any[]>((resolve, reject) => {
      const sql = `SELECT id, subject, grade, "topicUz", status, "generatedAt", "viewCount",
                   jsonb_array_length(tasks) as task_count
                   FROM worksheets
                   WHERE "userId" = '${user.id}'
                   ORDER BY "generatedAt" DESC
                   LIMIT 50;`;

      const proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', '-t', '-A', '-F', '|']);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`SQL execution failed: ${stderr}`));
        } else {
          // Парсим результаты
          const lines = stdout.trim().split('\n').filter(line => line.trim());
          const results = lines.map(line => {
            const parts = line.split('|');
            return {
              id: parts[0],
              subject: parts[1],
              grade: parseInt(parts[2]),
              topicUz: parts[3],
              status: parts[4],
              generatedAt: parts[5],
              viewCount: parseInt(parts[6] || '0'),
              taskCount: parseInt(parts[7] || '0'),
            };
          });
          resolve(results);
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });

      proc.stdin.write(sql);
      proc.stdin.end();
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
