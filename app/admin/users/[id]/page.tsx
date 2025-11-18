'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  specialty: string | null;
  school: string | null;
  subscriptionPlan: string;
  subscriptionExpiresAt: string | null;
  subscriptionStartedAt: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  worksheetsCount: number;
}

interface SubscriptionPlan {
  id: string;
  planCode: string;
  nameUz: string;
  nameRu: string;
  priceUzs: number;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  // Editable fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [specialty, setSpecialty] = useState('');
  const [school, setSchool] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('BEMINNAT');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchUserProfile();
  }, [userId]);

  const fetchSubscriptionPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);

      // Initialize editable fields
      setName(data.user.name || '');
      setEmail(data.user.email || '');
      setRole(data.user.role);
      setSpecialty(data.user.specialty || '');
      setSchool(data.user.school || '');
      setSubscriptionPlan(data.user.subscriptionPlan);
      setIsActive(data.user.isActive);
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Ошибка при загрузке профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          role,
          specialty: specialty || null,
          school: school || null,
          subscriptionPlan,
          isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      alert('Профиль успешно обновлен');
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Ошибка при обновлении профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${user?.name || user?.phone}? Это действие необратимо!`)) {
      return;
    }

    if (!confirm('Это точно удалит пользователя и все его данные. Продолжить?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      alert('Пользователь успешно удален');
      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка при удалении пользователя');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Загрузка профиля...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-red-600">Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/users"
            className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-flex"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
            <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
            <span>Назад к списку пользователей</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Профиль пользователя
          </h1>
          <p className="text-gray-600">{user.phone}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Основная информация
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите имя"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={user.phone}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Телефон нельзя изменить</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Специальность (для учителей)
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Не выбрано</option>
                    <option value="PRIMARY_SCHOOL">Начальная школа</option>
                    <option value="MATHEMATICS">Математика</option>
                    <option value="INFORMATICS">Информатика</option>
                    <option value="PHYSICS">Физика</option>
                    <option value="CHEMISTRY">Химия</option>
                    <option value="BIOLOGY">Биология</option>
                    <option value="LANGUAGES">Языки</option>
                    <option value="OTHER">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Школа
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Название школы"
                  />
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Подписка
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    План подписки
                  </label>
                  <select
                    value={subscriptionPlan}
                    onChange={(e) => setSubscriptionPlan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {subscriptionPlans.map((plan) => (
                      <option key={plan.planCode} value={plan.planCode}>
                        {plan.nameRu} ({plan.nameUz}) - {plan.priceUzs.toLocaleString()} сум
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Текущий: {subscriptionPlans.find(p => p.planCode === subscriptionPlan)?.nameRu || subscriptionPlan}
                  </p>
                </div>

                {user.subscriptionStartedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата начала подписки
                    </label>
                    <input
                      type="text"
                      value={new Date(user.subscriptionStartedAt).toLocaleDateString('ru-RU')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                )}

                {user.subscriptionExpiresAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата окончания подписки
                    </label>
                    <input
                      type="text"
                      value={new Date(user.subscriptionExpiresAt).toLocaleDateString('ru-RU')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Статус аккаунта
              </h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Активный аккаунт
                    </span>
                    <p className="text-sm text-gray-500">
                      {isActive ? 'Пользователь может войти в систему' : 'Пользователь заблокирован'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Удалить пользователя
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Статистика
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Рабочих листов</span>
                  <span className="text-sm font-semibold text-gray-900">{user.worksheetsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Дата регистрации</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Последний вход</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(user.lastLoginAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Быстрые действия
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/admin/users/${userId}/worksheets`}
                  className="block w-full px-4 py-2 text-sm text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Просмотреть рабочие листы
                </Link>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {isActive ? 'Заблокировать' : 'Разблокировать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
