import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, sendOTP } from '@/lib/sms';
import { saveOTP, checkRateLimit, incrementRateLimit } from '@/lib/redis';
import { findUserByPhone } from '@/lib/db-users';

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

    // Форматируем номер: добавляем +998 если его нет
    let formattedPhone = phone.trim();

    // Убираем все нечисловые символы кроме +
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');

    // Добавляем +998 если номер начинается без кода страны
    if (formattedPhone.match(/^9\d{8}$/)) {
      formattedPhone = `+998${formattedPhone}`;
    } else if (formattedPhone.match(/^998\d{9}$/)) {
      formattedPhone = `+${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+998')) {
      formattedPhone = `+998${formattedPhone}`;
    }

    // Проверяем финальный формат
    if (!formattedPhone.match(/^\+998\d{9}$/)) {
      return NextResponse.json(
        { success: false, message: 'Неверный формат номера телефона. Введите 9 цифр (например: 946392125)' },
        { status: 400 }
      );
    }

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

    // Проверяем rate limit
    const canSend = await checkRateLimit(formattedPhone);
    if (!canSend) {
      return NextResponse.json(
        {
          success: false,
          message: 'Превышен лимит отправки SMS. Попробуйте через 15 минут.'
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

    // Увеличиваем счётчик rate limit
    await incrementRateLimit(formattedPhone);

    return NextResponse.json({
      success: true,
      message: 'OTP код отправлен на ваш номер',
      data: {
        phone: formattedPhone,
        expiresIn: 300, // 5 минут в секундах
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
