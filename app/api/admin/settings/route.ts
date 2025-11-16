import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import { getAllSettings, updateSettings, getSettingsWithMetadata } from '@/lib/settings';

/**
 * GET /api/admin/settings
 * Get all site settings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен авторизации не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Недействительный или истёкший токен' },
        { status: 401 }
      );
    }

    // Get user
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен. Требуются права администратора.' },
        { status: 403 }
      );
    }

    // Get query parameter for detailed metadata
    const url = new URL(request.url);
    const detailed = url.searchParams.get('detailed') === 'true';

    if (detailed) {
      // Return settings with metadata
      const settings = await getSettingsWithMetadata();
      return NextResponse.json({ settings });
    } else {
      // Return just key-value pairs
      const settings = await getAllSettings();
      return NextResponse.json({ settings });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении настроек' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update site settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Токен авторизации не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Недействительный или истёкший токен' },
        { status: 401 }
      );
    }

    // Get user
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещен. Требуются права администратора.' },
        { status: 403 }
      );
    }

    // Get settings from request body
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Неверный формат данных' },
        { status: 400 }
      );
    }

    // Update settings
    await updateSettings(settings, user.id);

    // Return updated settings
    const updatedSettings = await getAllSettings();

    return NextResponse.json({
      message: 'Настройки успешно обновлены',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек' },
      { status: 500 }
    );
  }
}
