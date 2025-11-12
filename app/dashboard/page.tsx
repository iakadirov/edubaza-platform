'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  phone: string;
  name: string | null;
  specialty: string | null;
  school: string | null;
  subscriptionPlan: string;
}

const specialtyLabels: Record<string, string> = {
  PRIMARY_SCHOOL: 'Начальные классы (1-4)',
  MATHEMATICS: 'Математика',
  RUSSIAN_LANGUAGE: 'Русский язык',
  UZBEK_LANGUAGE: 'Узбекский язык',
  ENGLISH_LANGUAGE: 'Английский язык',
  PHYSICS: 'Физика',
  CHEMISTRY: 'Химия',
  BIOLOGY: 'Биология',
  GEOGRAPHY: 'География',
  HISTORY: 'История',
  LITERATURE: 'Литература',
  INFORMATICS: 'Информатика',
  PHYSICAL_EDUCATION: 'Физическая культура',
  MUSIC: 'Музыка',
  ART: 'Изобразительное искусство',
  OTHER: 'Другое',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию и загружаем данные с сервера
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    // Загружаем актуальные данные с сервера
    fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
          // Обновляем localStorage актуальными данными
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          // Если токен невалидный, редирект на логин
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Добро пожаловать в EduBaza.uz!
              </h1>
              <p className="text-gray-600 mt-1">
                Панель управления
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Информация о пользователе
            </h2>
            <Link
              href="/profile"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Редактировать профиль
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Телефон:</span>
              <span className="font-semibold">{user.phone}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">ФИО:</span>
              <span className="font-semibold">{user.name || 'Не указано'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Специальность:</span>
              <span>{user.specialty ? specialtyLabels[user.specialty] || user.specialty : 'Не указано'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Школа:</span>
              <span>{user.school || 'Не указано'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Тарифный план:</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {user.subscriptionPlan}
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Успешная авторизация!</strong> Вы вошли в систему через SMS OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
