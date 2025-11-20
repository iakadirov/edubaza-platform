import { NextRequest, NextResponse } from 'next/server';
import { getOTP, deleteOTP } from '@/lib/redis';
import { generateToken } from '@/lib/jwt';
import { findOrCreateUser } from '@/lib/db-users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, skipUserCreation } = body;

    // Валидация
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Номер телефона и OTP код обязательны' },
        { status: 400 }
      );
    }

    // Форматируем номер: добавляем +998 если его нет
    let formattedPhone = phone.trim();
    formattedPhone = formattedPhone.replace(/[^\d+]/g, '');

    if (formattedPhone.match(/^9\d{8}$/)) {
      formattedPhone = `+998${formattedPhone}`;
    } else if (formattedPhone.match(/^998\d{9}$/)) {
      formattedPhone = `+${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+998')) {
      formattedPhone = `+998${formattedPhone}`;
    }

    if (!formattedPhone.match(/^\+998\d{9}$/)) {
      return NextResponse.json(
        { success: false, message: 'Неверный формат номера телефона' },
        { status: 400 }
      );
    }

    // Проверяем OTP из Redis
    const storedOTP = await getOTP(formattedPhone);

    if (!storedOTP) {
      return NextResponse.json(
        {
          success: false,
          message: 'OTP код истёк или не найден. Запросите новый код.'
        },
        { status: 400 }
      );
    }

    if (storedOTP !== otp) {
      return NextResponse.json(
        { success: false, message: 'Неверный OTP код' },
        { status: 400 }
      );
    }

    // Если это только проверка OTP для регистрации - НЕ удаляем код и НЕ создаем пользователя
    if (skipUserCreation) {
      // Проверяем, существует ли пользователь
      const { findUserByPhone } = await import('@/lib/db-users-extended');
      const existingUser = await findUserByPhone(formattedPhone);

      return NextResponse.json({
        success: true,
        message: 'OTP код верный',
        userExists: !!existingUser,
      });
    }

    // OTP верный, удаляем его из Redis (только для полной авторизации)
    await deleteOTP(formattedPhone);

    // Находим или создаём пользователя
    const user = await findOrCreateUser(formattedPhone);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Ошибка создания пользователя' },
        { status: 500 }
      );
    }

    // Генерируем JWT токен
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      subscriptionPlan: user.subscriptionPlan,
    });

    // Возвращаем токен и данные пользователя
    return NextResponse.json({
      success: true,
      message: 'Авторизация успешна',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          specialty: user.specialty,
          school: user.school,
          subscriptionPlan: user.subscriptionPlan,
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
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
