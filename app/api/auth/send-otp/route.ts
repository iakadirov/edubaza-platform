import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, sendOTP } from '@/lib/sms';
import { saveOTP, checkAndIncrementRateLimit } from '@/lib/redis';
import { findUserByPhone } from '@/lib/db-users';
import { formatUzbekPhone } from '@/lib/phone-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, type = 'register' } = body; // type: 'register' | 'reset'

    // Валидация номера телефона
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Номер телефона обязателен' },
        { status: 400 }
      );
    }

    // ОПТИМИЗИРОВАНО: Используем централизованную функцию форматирования
    const phoneValidation = formatUzbekPhone(phone);

    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, message: phoneValidation.error || 'Неверный формат номера телефона' },
        { status: 400 }
      );
    }

    const formattedPhone = phoneValidation.formatted;

    // Проверяем существование пользователя
    const existingUser = await findUserByPhone(formattedPhone);

    // Для регистрации - пользователь НЕ должен существовать
    if (type === 'register' && existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Пользователь с таким номером уже зарегистрирован'
        },
        { status: 400 }
      );
    }

    // Для восстановления - пользователь ДОЛЖЕН существовать
    if (type === 'reset' && !existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Пользователь с таким номером не найден'
        },
        { status: 404 }
      );
    }

    // ОПТИМИЗИРОВАНО: Проверяем и инкрементируем rate limit за одну операцию
    const rateLimitResult = await checkAndIncrementRateLimit(formattedPhone, 3, 900);

    if (!rateLimitResult.allowed) {
      const minutesLeft = Math.ceil((rateLimitResult.resetAt - Date.now()) / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Превышен лимит отправки SMS. Попробуйте через ${minutesLeft} минут.`,
          data: {
            attemptsLeft: 0,
            resetAt: rateLimitResult.resetAt,
          },
        },
        { status: 429 }
      );
    }

    // Генерируем 6-значный OTP код
    const otp = generateOTP();

    // Сохраняем OTP в Redis (действителен 5 минут)
    await saveOTP(formattedPhone, otp);

    // Отправляем SMS с правильным типом сообщения
    const smsSent = await sendOTP(formattedPhone, otp, type);

    if (!smsSent) {
      return NextResponse.json(
        { success: false, message: 'Ошибка отправки SMS. Попробуйте позже.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP код отправлен на ваш номер',
      data: {
        phone: formattedPhone,
        expiresIn: 300, // 5 минут в секундах
        attemptsLeft: rateLimitResult.attemptsLeft,
        resetAt: rateLimitResult.resetAt,
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Внутренняя ошибка сервера',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
