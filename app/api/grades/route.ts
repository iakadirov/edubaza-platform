import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyToken } from '@/lib/jwt';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Получаем все классы из базы данных
    const sql = `SELECT number, name_uz, is_active FROM grades ORDER BY number;`;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql}"`
    );

    if (!stdout || stdout.trim() === '') {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Парсим результаты
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const grades = lines.map(line => {
      const parts = line.split('|');
      return {
        number: parseInt(parts[0]),
        nameUz: parts[1],
        isActive: parts[2] === 't',
      };
    });

    return NextResponse.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error('Get grades error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении классов',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update grade (change names or activate/deactivate)
export async function PUT(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { number, nameUz, isActive } = body;

    if (number === undefined || number === null || number < 0 || number > 11) {
      return NextResponse.json(
        { success: false, message: 'Номер класса должен быть от 0 до 11' },
        { status: 400 }
      );
    }

    // Экранирование
    const nameUzEsc = nameUz.replace(/'/g, "''");

    const sql = `
      UPDATE grades
      SET name_uz = '${nameUzEsc}',
          is_active = ${isActive},
          updated_at = NOW()
      WHERE number = ${number};
    `;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${sql.replace(/\n/g, ' ')}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Класс успешно обновлён',
    });
  } catch (error) {
    console.error('Update grade error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при обновлении класса',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
