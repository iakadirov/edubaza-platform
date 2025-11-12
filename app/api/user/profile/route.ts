import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone, updateUserProfile, TeacherSpecialty } from '@/lib/db-users';

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

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        specialty: user.specialty,
        school: user.school,
        subscriptionPlan: user.subscriptionPlan,
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
    const { name, specialty, school } = body;

    // Валидация
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Имя должно быть строкой' },
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

    // Обновляем профиль
    const user = await updateUserProfile(payload.phone, {
      name,
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
        email: user.email,
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
