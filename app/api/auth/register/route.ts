import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, deleteOTP } from '@/lib/redis';
import { findUserByPhone, createUserExtended, type UserRole } from '@/lib/db-users-extended';
import { generateToken } from '@/lib/jwt';
import { createSession, checkSessionLimit, deleteOldestSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      otp,
      firstName,
      lastName,
      role,
      password,
      specialty,
      school,
      rememberMe = true,
    } = body;

    // 1. Валидация обязательных полей
    if (!phone || !otp || !firstName || !lastName || !role || !password) {
      return NextResponse.json(
        {
          error: 'Требуются все поля: phone, otp, firstName, lastName, role, password',
        },
        { status: 400 }
      );
    }

    // 2. Валидация роли
    const validRoles: UserRole[] = ['TEACHER', 'STUDENT', 'PARENT'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: 'Неверная роль. Доступны: TEACHER, STUDENT, PARENT',
        },
        { status: 400 }
      );
    }

    // 3. Валидация specialty для учителей
    if (role === 'TEACHER' && !specialty) {
      return NextResponse.json(
        {
          error: 'Для учителей обязательно поле specialty',
        },
        { status: 400 }
      );
    }

    // 4. Валидация пароля
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: 'Пароль должен быть минимум 6 символов',
        },
        { status: 400 }
      );
    }

    // 5. Проверка OTP кода (НЕ удаляем пока, чтобы можно было повторить при ошибке)
    const otpValid = await verifyOTP(phone, otp, false);
    if (!otpValid) {
      return NextResponse.json(
        {
          error: 'Неверный или истекший OTP код',
        },
        { status: 400 }
      );
    }

    // 6. Проверка что пользователь еще не существует
    const existingUser = await findUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Пользователь с этим номером уже зарегистрирован',
        },
        { status: 400 }
      );
    }

    // 7. Создание пользователя
    console.log('Creating user with params:', {
      phone,
      firstName,
      lastName,
      role,
      specialty: role === 'TEACHER' ? specialty : undefined,
      school: role === 'TEACHER' ? school : undefined,
      hasPassword: !!password,
    });

    const user = await createUserExtended({
      phone,
      firstName,
      lastName,
      role,
      password,
      specialty: role === 'TEACHER' ? specialty : undefined,
      school: role === 'TEACHER' ? school : undefined,
    });

    if (!user) {
      console.error('createUserExtended returned null for phone:', phone);
      return NextResponse.json(
        {
          error: 'Ошибка создания пользователя. Проверьте корректность данных.',
        },
        { status: 500 }
      );
    }

    console.log('User created successfully:', { id: user.id, phone: user.phone, role: user.role });

    // 8. Генерация JWT токена
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

    // 9. Проверка лимита сессий
    const sessionCheck = await checkSessionLimit(user.id, user.subscriptionPlan);

    if (sessionCheck.exceeded) {
      // Удалить самую старую сессию
      await deleteOldestSession(user.id);
    }

    // 10. Создание сессии
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'Unknown';

    const expiresInSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 дней или 24 часа

    await createSession({
      userId: user.id,
      token,
      userAgent,
      ipAddress,
      expiresIn: expiresInSeconds,
    });

    // 11. Удаляем OTP код после успешной регистрации
    await deleteOTP(phone);

    // 12. Успешный ответ
    return NextResponse.json({
      message: 'Регистрация успешна',
      token,
      expiresIn,
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        specialty: user.specialty,
        school: user.school,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}
