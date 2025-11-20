import { NextRequest, NextResponse } from 'next/server';
import { checkUserPassword, updateLastLogin } from '@/lib/db-users-extended';
import { generateToken } from '@/lib/jwt';
import { createSession, checkSessionLimit, deleteOldestSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password, rememberMe = false } = body;

    // 1. Валидация полей
    if (!phone || !password) {
      return NextResponse.json(
        {
          error: 'Требуются поля: phone, password',
        },
        { status: 400 }
      );
    }

    // 2. Проверка пароля и получение пользователя
    const user = await checkUserPassword(phone, password);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Неверный телефон или пароль',
        },
        { status: 401 }
      );
    }

    // 3. Проверка что аккаунт активен
    // (можно добавить проверку isActive если нужно)

    // 4. Генерация JWT токена
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = generateToken(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
      expiresIn
    );

    // 5. Проверка лимита сессий
    const sessionCheck = await checkSessionLimit(user.id, user.subscriptionPlan);

    if (sessionCheck.exceeded) {
      // Автоматически удалить самую старую сессию
      await deleteOldestSession(user.id);
    }

    // 6. Создание новой сессии
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'Unknown';

    const expiresInSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    await createSession({
      userId: user.id,
      token,
      userAgent,
      ipAddress,
      expiresIn: expiresInSeconds,
    });

    // 7. Обновить время последнего входа
    await updateLastLogin(user.id);

    // 8. Успешный ответ
    return NextResponse.json({
      message: 'Вход выполнен успешно',
      token,
      expiresIn,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        school: user.school,
        subscriptionPlan: user.subscriptionPlan,
        hasPassword: user.hasPassword,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}
