import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone, isAdmin } from '@/lib/db-users';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, isAdmin: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, isAdmin: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { success: false, isAdmin: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: isAdmin(user),
      role: user.role,
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      {
        success: false,
        isAdmin: false,
        message: 'Ошибка при проверке прав',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
