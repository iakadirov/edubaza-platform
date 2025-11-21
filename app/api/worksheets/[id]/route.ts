import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const worksheetId = params.id;

    // Получаем worksheet через docker exec
    const { spawn } = require('child_process');

    const worksheet = await new Promise<any>((resolve, reject) => {
      // Админы могут просматривать все worksheets, обычные пользователи - только свои
      const userCondition = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
        ? ''
        : `AND "userId" = '${user.id}'`;

      const sql = `SELECT id, "userId", subject, grade, "topicUz", "topicRu", config, tasks, status, "generatedAt", "viewCount", ai_debug_info
                   FROM worksheets
                   WHERE id = '${worksheetId}' ${userCondition}
                   LIMIT 1;`;

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
          const line = stdout.trim();
          if (!line) {
            resolve(null);
            return;
          }

          const parts = line.split('|');
          const aiDebugInfoRaw = parts[11];
          resolve({
            id: parts[0],
            userId: parts[1],
            subject: parts[2],
            grade: parseInt(parts[3]),
            topicUz: parts[4],
            topicRu: parts[5],
            config: JSON.parse(parts[6]),
            tasks: JSON.parse(parts[7]),
            status: parts[8],
            generatedAt: parts[9],
            viewCount: parseInt(parts[10] || '0'),
            aiDebugInfo: aiDebugInfoRaw && aiDebugInfoRaw !== '' ? JSON.parse(aiDebugInfoRaw) : null,
          });
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });

      proc.stdin.write(sql);
      proc.stdin.end();
    });

    if (!worksheet) {
      return NextResponse.json(
        { success: false, message: 'Worksheet не найден' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    const updateProc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', '-t', '-A']);
    updateProc.stdin.write(`UPDATE worksheets SET "viewCount" = "viewCount" + 1 WHERE id = '${worksheetId}';`);
    updateProc.stdin.end();

    return NextResponse.json({
      success: true,
      data: worksheet,
    });
  } catch (error) {
    console.error('Get worksheet error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении worksheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
