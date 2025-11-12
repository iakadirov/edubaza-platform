import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Получаем токен из заголовка Authorization
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { success: false, message: 'Токен авторизации не найден' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Убираем "Bearer "

      // Проверяем токен
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, message: 'Недействительный или истёкший токен' },
          { status: 401 }
        );
      }

      // Добавляем данные пользователя в request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = payload;

      // Вызываем оригинальный handler
      return await handler(authenticatedRequest);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Ошибка авторизации' },
        { status: 500 }
      );
    }
  };
}
