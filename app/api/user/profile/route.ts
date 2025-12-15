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
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Получаем информацию о плане
    const planSql = `SELECT plan_code, name_uz, name_ru, price_uzs, features, limits, show_watermark FROM subscription_plans WHERE plan_code = '${user.subscriptionPlan}' AND is_active = TRUE LIMIT 1;`;

    let planInfo = null;
    try {
      const { stdout: planStdout } = await execAsync(
        `PGPASSWORD='${process.env.DATABASE_PASSWORD}' psql -h localhost -U edubaza -d edubaza -t -A -F"|" -c "${planSql}"`
      );

      const line = planStdout.trim();
      if (line) {
        const parts = line.split('|');
        planInfo = {
          planCode: parts[0],
          nameUz: parts[1],
          nameRu: parts[2],
          priceUzs: parseInt(parts[3]),
          features: JSON.parse(parts[4] || '{}'),
          limits: JSON.parse(parts[5] || '{}'),
          showWatermark: parts[6] === 't',
        };
      }
    } catch (error) {
      console.error('Error fetching plan info:', error);
      // Продолжаем без информации о плане
    }

    // Подсчитываем использованные ресурсы
    let worksheetsThisMonth = 0;
    try {
      const countSql = `SELECT COUNT(*) FROM worksheets WHERE "userId" = '${user.id}' AND "generatedAt" >= DATE_TRUNC('month', CURRENT_DATE);`;
      const countStdout = await executeSql(countSql);
      worksheetsThisMonth = parseInt(countStdout.trim()) || 0;
    } catch (error) {
      console.error('Error counting worksheets:', error);
      // Продолжаем с 0
    }

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
