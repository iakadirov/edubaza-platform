'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  onAuth: (user: TelegramUser) => void;
  botUsername?: string;
}

declare global {
  interface Window {
    TelegramLoginWidget?: {
      dataOnauth: (user: TelegramUser) => void;
    };
  }
}

export default function TelegramLoginButton({ onAuth, botUsername }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const botName = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'edubaza_uz_bot';

  useEffect(() => {
    // Создаём глобальную callback функцию
    window.TelegramLoginWidget = {
      dataOnauth: (user: TelegramUser) => {
        handleTelegramAuth(user);
      },
    };

    // Загружаем Telegram Widget скрипт
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;

      containerRef.current.appendChild(script);
    }

    return () => {
      // Очистка
      delete window.TelegramLoginWidget;
    };
  }, [botName]);

  const handleTelegramAuth = async (telegramUser: TelegramUser) => {
    try {
      // Отправляем данные на наш API
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramUser),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Сохраняем токен и пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Вызываем callback
        onAuth(telegramUser);

        // Редирект на dashboard
        router.push('/dashboard');
      } else {
        console.error('Telegram auth failed:', data.error);
        alert(data.error || 'Telegram orqali kirish xatosi');
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      alert('Server bilan aloqa xatosi');
    }
  };

  return (
    <div className="w-full">
      {/* Контейнер для Telegram Widget */}
      <div ref={containerRef} className="telegram-login-container" />

      {/* Стили для Telegram виджета */}
      <style jsx>{`
        .telegram-login-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Стилизация iframe Telegram виджета */
        .telegram-login-container :global(iframe) {
          width: 100% !important;
          max-width: 100% !important;
          height: 48px !important;
        }
      `}</style>
    </div>
  );
}
