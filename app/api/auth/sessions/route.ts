import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { getUserSessions, deleteSession, deleteOtherSessions, hashToken } from '@/lib/sessions';

// GET /api/auth/sessions - получить список активных сессий
export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Пользователь не авторизован',
        },
        { status: 401 }
      );
    }

    // Получить все активные сессии пользователя
    const sessions = await getUserSessions(userId);

    // Получить текущий токен из заголовка
    const authHeader = request.headers.get('authorization');
    const currentToken = authHeader?.replace('Bearer ', '');
    const currentTokenHash = currentToken ? hashToken(currentToken) : null;

    // Маппинг сессий для ответа
    const sessionsResponse = sessions.map((session) => ({
      id: session.id,
      device: {
        browser: session.deviceInfo.browser,
        os: session.deviceInfo.os,
        deviceType: session.deviceInfo.device,
      },
      ipAddress: session.ipAddress,
      location: session.location || 'Unknown',
      createdAt: session.createdAt,
      lastActive: session.lastActive,
      expiresAt: session.expiresAt,
      isCurrent: session.tokenHash === currentTokenHash,
    }));

    return NextResponse.json({
      sessions: sessionsResponse,
      count: sessionsResponse.length,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
});

// DELETE /api/auth/sessions - удалить сессию
export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Пользователь не авторизован',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const deleteOthers = searchParams.get('deleteOthers') === 'true';

    // Получить текущий токен
    const authHeader = request.headers.get('authorization');
    const currentToken = authHeader?.replace('Bearer ', '');
    const currentTokenHash = currentToken ? hashToken(currentToken) : null;

    if (deleteOthers) {
      // Удалить все сессии кроме текущей
      if (!currentTokenHash) {
        return NextResponse.json(
          {
            error: 'Не удалось определить текущую сессию',
          },
          { status: 400 }
        );
      }

      const success = await deleteOtherSessions(userId, currentTokenHash);

      if (!success) {
        return NextResponse.json(
          {
            error: 'Ошибка удаления сессий',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Все остальные сессии завершены',
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        {
          error: 'Требуется параметр sessionId',
        },
        { status: 400 }
      );
    }

    // Удалить конкретную сессию
    const success = await deleteSession(sessionId, userId);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Ошибка удаления сессии',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Сессия завершена',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
});
