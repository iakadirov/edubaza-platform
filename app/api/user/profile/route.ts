import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone as findUserByPhoneOld, TeacherSpecialty } from '@/lib/db-users';
import { findUserByPhone, findUserById, updateUserProfileExtended } from '@/lib/db-users-extended';

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

    // Получаем информацию о тарифном плане из базы данных
    const { spawn } = require('child_process');

    // Получаем информацию о плане
    const planSql = `SELECT plan_code, name_uz, name_ru, price_uzs, features, limits, show_watermark
                     FROM subscription_plans
                     WHERE plan_code = '${user.subscriptionPlan}' AND is_active = TRUE
                     LIMIT 1`;

    const planInfo = await new Promise<any>((resolve, reject) => {
      const proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', '-t', '-A', '-F', '|']);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data: any) => { stdout += data.toString(); });
      proc.stderr.on('data', (data: any) => { stderr += data.toString(); });

      proc.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error(`SQL execution failed: ${stderr}`));
        } else {
          const line = stdout.trim();
          if (!line) {
            resolve(null);
            return;
          }

          const parts = line.split('|');
          resolve({
            planCode: parts[0],
            nameUz: parts[1],
            nameRu: parts[2],
            priceUzs: parseInt(parts[3]),
            features: JSON.parse(parts[4] || '{}'),
            limits: JSON.parse(parts[5] || '{}'),
            showWatermark: parts[6] === 't',
          });
        }
      });

      proc.on('error', (err: Error) => reject(err));
      proc.stdin.write(planSql);
      proc.stdin.end();
    });

    // Подсчитываем использованные ресурсы
    const worksheetsThisMonth = await new Promise<number>((resolve, reject) => {
      const countSql = `SELECT COUNT(*) FROM worksheets
                        WHERE "userId" = '${user.id}'
                        AND "generatedAt" >= DATE_TRUNC('month', CURRENT_DATE)`;

      const proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', '-t', '-A']);

      let stdout = '';
      proc.stdout.on('data', (data: any) => { stdout += data.toString(); });
      proc.on('close', () => resolve(parseInt(stdout.trim()) || 0));
      proc.on('error', reject);
      proc.stdin.write(countSql);
      proc.stdin.end();
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        school: user.school,
        subscriptionPlan: user.subscriptionPlan,
        planInfo: planInfo,
        usage: {
          worksheetsThisMonth,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Парсим body
    const body = await request.json();
    const { name, firstName, lastName, specialty, school } = body;

    // Валидация
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Имя должно быть строкой' },
        { status: 400 }
      );
    }

    if (firstName !== undefined && typeof firstName !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Имя должно быть строкой' },
        { status: 400 }
      );
    }

    if (lastName !== undefined && typeof lastName !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Фамилия должна быть строкой' },
        { status: 400 }
      );
    }

    if (specialty !== undefined && specialty !== null) {
      const validSpecialties: TeacherSpecialty[] = [
        'PRIMARY_SCHOOL',
        'MATHEMATICS',
        'RUSSIAN_LANGUAGE',
        'UZBEK_LANGUAGE',
        'ENGLISH_LANGUAGE',
        'PHYSICS',
        'CHEMISTRY',
        'BIOLOGY',
        'GEOGRAPHY',
        'HISTORY',
        'LITERATURE',
        'INFORMATICS',
        'PHYSICAL_EDUCATION',
        'MUSIC',
        'ART',
        'OTHER',
      ];

      if (!validSpecialties.includes(specialty)) {
        return NextResponse.json(
          { success: false, message: 'Неверная специальность' },
          { status: 400 }
        );
      }
    }

    if (school !== undefined && school !== null && typeof school !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Название школы должно быть строкой' },
        { status: 400 }
      );
    }

    // Получаем текущего пользователя
    const currentUser = await findUserByPhone(payload.phone);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Обновляем профиль
    const user = await updateUserProfileExtended(currentUser.id, {
      name,
      firstName,
      lastName,
      specialty,
      school,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Ошибка обновления профиля' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлён',
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        school: user.school,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
