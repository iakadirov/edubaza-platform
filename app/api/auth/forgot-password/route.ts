import { NextRequest, NextResponse } from 'next/server';
import { findUserByPhone } from '@/lib/db-users-extended';
import { generateOTP, sendOTP } from '@/lib/sms';
import { saveOTP, checkRateLimit, incrementRateLimit } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // 1. Валидация
    if (!phone) {
      return NextResponse.json(
        {
          error: 'Требуется поле: phone',
        },
        { status: 400 }
      );
    }

    // 2. Проверка что пользователь существует
    const user = await findUserByPhone(phone);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Пользователь с таким номером не найден',
        },
        { status: 404 }
      );
    }

    // 3. Проверка что у пользователя есть пароль
    if (!user.hasPassword) {
      return NextResponse.json(
        {
          error: 'У вас нет установленного пароля. Войдите через Telegram или установите пароль в профиле',
        },
        { status: 400 }
      );
    }

    // 4. Проверяем rate limit
    const canSend = await checkRateLimit(phone);
    if (!canSend) {
      return NextResponse.json(
        {
          error: 'Превышен лимит отправки SMS. Попробуйте через 15 минут.',
        },
        { status: 429 }
      );
    }

    // 5. Генерируем OTP код
    const otp = generateOTP();

    // 6. Сохраняем OTP в Redis (действителен 5 минут)
    await saveOTP(phone, otp);

    // 7. Отправляем SMS для восстановления пароля
    const smsSent = await sendOTP(phone, otp, 'reset');

    if (!smsSent) {
      return NextResponse.json(
        {
          error: 'Ошибка отправки SMS. Попробуйте позже.',
        },
        { status: 500 }
      );
    }

    // 8. Увеличиваем счётчик rate limit
    await incrementRateLimit(phone);

    // 9. Успешный ответ
    return NextResponse.json({
      message: 'Код подтверждения отправлен на ваш номер',
      expiresIn: 300, // 5 минут
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}
