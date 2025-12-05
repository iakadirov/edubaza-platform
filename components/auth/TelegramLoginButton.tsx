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

  const handleClick = () => {
    // В продакшене здесь будет открываться Telegram auth
    // Пока просто показываем сообщение
    alert('Telegram avtorizatsiyasi sozlanmoqda...\n\nБот настраивается, скоро будет доступно!');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#229ED9] hover:bg-[#1e8bc3] text-white font-semibold rounded-lg transition-colors shadow-sm"
    >
      {/* Telegram Icon SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z"
          fill="currentColor"
        />
      </svg>
      <span>Telegram orqali kirish</span>
    </button>
  );
}
