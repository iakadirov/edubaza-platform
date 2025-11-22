import { NextRequest, NextResponse } from 'next/server';
import { getOTP, deleteOTP } from '@/lib/redis';
import { generateToken } from '@/lib/jwt';
import { createUserWithPassword, findUserByPhone } from '@/lib/db-users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, password, type = 'register' } = body; // type: 'register' | 'reset'

    // Валидация
    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: 'Номер телефона и OTP код обязательны' },
        { status: 400 }
      );
    }

    // Для регистрации пароль обязателен
    if (type === 'register' && !password) {
      return NextResponse.json(
        { success: false, message: 'Пароль обязателен' },
        { status: 400 }
      );
    }

    // Валидация пароля (минимум 6 символов)
    if (type === 'register' && password && password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Пароль должен содержать минимум 6 символов' },
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

    // OTP верный, удаляем его из Redis
    await deleteOTP(formattedPhone);

    if (type === 'register') {
      // Проверяем, не существует ли уже пользователь
      const existingUser = await findUserByPhone(formattedPhone);
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Пользователь с таким номером уже зарегистрирован' },
          { status: 400 }
        );
      }

      // Создаём пользователя с паролем
      const user = await createUserWithPassword(formattedPhone, password);

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

      return NextResponse.json({
        success: true,
        message: 'Регистрация успешна',
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
    } else {
      // Для сброса пароля - просто подтверждаем OTP
      // Проверяем, что пользователь существует
      const user = await findUserByPhone(formattedPhone);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Пользователь не найден' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP код верный',
        data: {
          phone: formattedPhone,
        },
      });
    }
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
