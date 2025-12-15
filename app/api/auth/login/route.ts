import { NextRequest, NextResponse } from 'next/server';
import { checkUserPasswordOptimized, updateLastLogin } from '@/lib/db-users-extended';
import { generateToken } from '@/lib/jwt';
import { createSessionOptimized } from '@/lib/sessions';
import { formatUzbekPhone } from '@/lib/phone-utils';

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

    // 2. Форматирование и валидация номера телефона
    const phoneValidation = formatUzbekPhone(phone);
    console.log('[Login] Phone validation:', { input: phone, formatted: phoneValidation.formatted, isValid: phoneValidation.isValid });
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        {
          error: phoneValidation.error || 'Неверный формат номера телефона',
        },
        { status: 400 }
      );
    }

    // 3. ОПТИМИЗИРОВАНО: Проверка пароля и получение пользователя (1 запрос вместо 2)
    console.log('[Login] Checking password for phone:', phoneValidation.formatted);
    const user = await checkUserPasswordOptimized(phoneValidation.formatted, password);
    console.log('[Login] User found:', !!user, user ? { id: user.id, phone: user.phone, hasPassword: user.hasPassword } : null);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Неверный телефон или пароль',
        },
        { status: 401 }
      );
    }

    // 4. Проверка что аккаунт активен
    // (можно добавить проверку isActive если нужно)

    // 5. Генерация JWT токена
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

    // 6. ОПТИМИЗИРОВАНО: Создание сессии с автоматическим управлением лимитами (1 запрос вместо 3)
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'Unknown';

    const expiresInSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    await createSessionOptimized(
      {
        userId: user.id,
        token,
        userAgent,
        ipAddress,
        expiresIn: expiresInSeconds,
      },
      user.subscriptionPlan
    );

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
    console.error('Login error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}
