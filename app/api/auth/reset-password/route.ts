import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/redis';
import { findUserByPhone, setUserPassword } from '@/lib/db-users-extended';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, newPassword } = body;

    // 1. Валидация
    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        {
          error: 'Требуются поля: phone, otp, newPassword',
        },
        { status: 400 }
      );
    }

    // 2. Валидация пароля
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: 'Пароль должен быть минимум 6 символов',
        },
        { status: 400 }
      );
    }

    // 3. Проверка OTP кода
    const otpValid = await verifyOTP(phone, otp);
    if (!otpValid) {
      return NextResponse.json(
        {
          error: 'Неверный или истекший OTP код',
        },
        { status: 400 }
      );
    }

    // 4. Проверка что пользователь существует
    const user = await findUserByPhone(phone);

    if (!user) {
      return NextResponse.json(
        {
          error: 'Пользователь не найден',
        },
        { status: 404 }
      );
    }

    // 5. Установка нового пароля
    const success = await setUserPassword(user.id, newPassword);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Ошибка обновления пароля',
        },
        { status: 500 }
      );
    }

    // 6. Успешный ответ
    return NextResponse.json({
      message: 'Пароль успешно изменен',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}
