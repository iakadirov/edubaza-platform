'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  device: {
    browser: string;
    os: string;
    deviceType: string;
  };
  ipAddress: string | null;
  location: string;
  createdAt: string;
  lastActive: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setSessions(data.sessions || []);
      } else {
        setError(data.error || 'Ошибка загрузки сессий');
      }
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Вы уверены, что хотите завершить эту сессию?')) {
      return;
    }

    setDeletingId(sessionId);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      } else {
        alert(data.error || 'Ошибка удаления сессии');
      }
    } catch (err) {
      alert('Ошибка сервера');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllOthers = async () => {
    if (!confirm('Вы уверены, что хотите завершить все остальные сессии?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/auth/sessions?deleteOthers=true', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        await fetchSessions();
      } else {
        alert(data.error || 'Ошибка удаления сессий');
      }
    } catch (err) {
      alert('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'mobile') return '📱';
    if (deviceType === 'tablet') return '📱';
    return '🖥️';
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка сессий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Активные сессии
          </h1>
          <p className="text-gray-600">
            Управляйте устройствами, на которых выполнен вход в ваш аккаунт
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Sessions Count */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего сессий</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>

            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <button
                onClick={handleDeleteAllOthers}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
              >
                Завершить все остальные
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                session.isCurrent ? 'border-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-4xl">
                    {getDeviceIcon(session.device.deviceType)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {session.device.browser}
                      </h3>
                      {session.isCurrent && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Текущее устройство
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">ОС:</span> {session.device.os}
                      </p>
                      {session.ipAddress && (
                        <p>
                          <span className="font-medium">IP:</span> {session.ipAddress}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Местоположение:</span> {session.location}
                      </p>
                      <p>
                        <span className="font-medium">Последняя активность:</span>{' '}
                        {formatDate(session.lastActive)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Создано: {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deletingId === session.id}
                    className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === session.id ? 'Удаление...' : 'Завершить'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {sessions.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600">Нет активных сессий</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Зачем управлять сессиями?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Видите все устройства, где выполнен вход в ваш аккаунт</li>
            <li>• Можете завершить сессию на потерянном или украденном устройстве</li>
            <li>• Защита аккаунта от несанкционированного доступа</li>
            <li>• Лимит одновременных устройств зависит от вашего тарифа</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
