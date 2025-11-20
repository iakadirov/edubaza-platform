import { NextRequest, NextResponse } from 'next/server';
import { findUserByPhone } from '@/lib/db-users-extended';
import { sendOTP } from '@/lib/sms';

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

    // 4. Отправка OTP кода
    const result = await sendOTP(phone);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Ошибка отправки SMS',
        },
        { status: 500 }
      );
    }

    // 5. Успешный ответ
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
