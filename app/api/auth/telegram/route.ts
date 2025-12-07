import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserByTelegramId, createUserExtended, updateUserProfileExtended } from '@/lib/db-users-extended';
import { generateToken } from '@/lib/jwt';
import { createSessionOptimized } from '@/lib/sessions';

interface TelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Проверка подлинности данных Telegram
 * https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(data: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  const { hash, ...authData } = data;

  // Создаём строку для проверки
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key as keyof typeof authData]}`)
    .join('\n');

  // Создаём секретный ключ из токена бота
  const secretKey = crypto
    .createHash('sha256')
    .update(botToken)
    .digest();

  // Создаём HMAC хеш
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Проверяем что хеши совпадают
  return hmac === hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const telegramData: TelegramAuthData = body;

    // 1. Валидация данных
    if (!telegramData.id || !telegramData.hash) {
      return NextResponse.json(
        { error: 'Telegram maʼlumotlari toʻliq emas' },
        { status: 400 }
      );
    }

    // 2. Проверка подлинности данных от Telegram
    if (!verifyTelegramAuth(telegramData)) {
      return NextResponse.json(
        { error: 'Telegram autentifikatsiya xatosi' },
        { status: 401 }
      );
    }

    // 3. Проверка срока действия (не старше 1 часа)
    const authAge = Date.now() / 1000 - telegramData.auth_date;
    if (authAge > 3600) {
      return NextResponse.json(
        { error: 'Telegram sessiyasi eskirgan. Qaytadan kiriting.' },
        { status: 401 }
      );
    }

    // 4. Ищем пользователя по Telegram ID
    let user = await findUserByTelegramId(telegramData.id);

    // 5. Если пользователь не найден - создаём нового
    if (!user) {
      // Создаём уникальный "телефон" для Telegram-only пользователей
      // Формат: +tg{telegram_id} - гарантированно уникален и не конфликтует с реальными номерами
      const virtualPhone = `+tg${telegramData.id}`;

      console.log('Creating new Telegram user:', {
        virtualPhone,
        telegramId: telegramData.id,
        firstName: telegramData.first_name,
        lastName: telegramData.last_name,
        username: telegramData.username,
      });

      try {
        const newUser = await createUserExtended({
          phone: virtualPhone,
          firstName: telegramData.first_name,
          lastName: telegramData.last_name,
          role: 'STUDENT', // По умолчанию студент
          telegramId: telegramData.id,
          telegramUsername: telegramData.username,
          telegramPhotoUrl: telegramData.photo_url,
        });

        if (!newUser) {
          console.error('createUserExtended returned null');
          return NextResponse.json(
            { error: 'Foydalanuvchi yaratishda xatolik' },
            { status: 500 }
          );
        }

        user = newUser;
      } catch (createError) {
        console.error('Error creating Telegram user:', createError);
        return NextResponse.json(
          { error: 'Foydalanuvchi yaratishda xatolik', details: createError instanceof Error ? createError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } else {
      // 6. Обновляем Telegram данные если они изменились
      await updateUserProfileExtended(user.id, {
        firstName: telegramData.first_name,
        lastName: telegramData.last_name,
        telegramUsername: telegramData.username,
        telegramPhotoUrl: telegramData.photo_url,
      });
    }

    // 7. Генерация JWT токена
    const expiresIn = '30d'; // Telegram вход всегда "запомнить меня"
    const token = generateToken(
      {
        userId: user.id,
        phone: user.phone,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
      expiresIn
    );

    // 8. Создание сессии с автоматическим управлением лимитами
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'Unknown';

    const expiresInSeconds = 30 * 24 * 60 * 60; // 30 дней

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

    // 9. Успешный ответ
    return NextResponse.json({
      message: 'Telegram orqali kirish muvaffaqiyatli',
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
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        telegramPhotoUrl: user.telegramPhotoUrl,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Server xatosi' },
      { status: 500 }
    );
  }
}
