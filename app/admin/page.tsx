'use client';

import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в Admin Panel
          </h1>
          <p className="text-gray-600">Центр управления платформой</p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Structure Card */}
          <Link
            href="/admin/structure"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-center mb-3">
              <div className="text-4xl mr-3">🏗️</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Структура
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Классы, предметы и темы
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Классы
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Предметы
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Темы
              </span>
            </div>
          </Link>

          {/* Content Library Card */}
          <Link
            href="/admin/content"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-green-500"
          >
            <div className="flex items-center mb-3">
              <div className="text-4xl mr-3">📚</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Библиотека
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Все учебные материалы в одном месте
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Задачи
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Тесты
              </span>
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                Материалы
              </span>
            </div>
          </Link>

          {/* Users Card */}
          <Link
            href="/admin/users"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-purple-500"
          >
            <div className="flex items-center mb-3">
              <div className="text-4xl mr-3">👥</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Пользователи
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Управление пользователями и доступом
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                Учителя
              </span>
              <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
                Ученики
              </span>
            </div>
          </Link>

          {/* Settings Card */}
          <Link
            href="/admin/settings"
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-orange-500"
          >
            <div className="flex items-center mb-3">
              <div className="text-4xl mr-3">⚙️</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Настройки
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Конфигурация системы и интеграции
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                Общие
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                AI & SMS
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                Безопасность
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Быстрая статистика
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-600 mt-1">Классов</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-xs text-gray-600 mt-1">Предметов</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-xs text-gray-600 mt-1">Тем</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <div className="text-xs text-gray-600 mt-1">Материалов</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
