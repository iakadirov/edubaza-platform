'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  phone: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        alert('У вас нет доступа к этой странице');
        router.push('/dashboard');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Refresh users list
      fetchUsers();
      alert('Роль успешно обновлена');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Ошибка при обновлении роли');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Загрузка пользователей...</div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'ALL' || user.role === filter;
    const matchesSearch = !searchQuery ||
      user.phone.includes(searchQuery) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800 border-red-200',
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    TEACHER: 'bg-blue-100 text-blue-800 border-blue-200',
    STUDENT: 'bg-green-100 text-green-800 border-green-200',
  };

  const roleLabels = {
    ADMIN: 'Админ',
    SUPER_ADMIN: 'Супер-админ',
    TEACHER: 'Учитель',
    STUDENT: 'Ученик',
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление пользователями
          </h1>
          <p className="text-gray-600">
            Всего пользователей: {users.length}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все ({users.length})
            </button>
            <button
              onClick={() => setFilter('STUDENT')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'STUDENT'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ученики ({users.filter(u => u.role === 'STUDENT').length})
            </button>
            <button
              onClick={() => setFilter('TEACHER')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'TEACHER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Учителя ({users.filter(u => u.role === 'TEACHER').length})
            </button>
            <button
              onClick={() => setFilter('ADMIN')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'ADMIN'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Админы ({users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length})
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            className="flex-1 min-w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Подписка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Пользователи не найдены
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {user.fullName || 'Без имени'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.subscriptionPlan ? (
                          <span className="capitalize">{user.subscriptionPlan}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => {
                            if (confirm(`Изменить роль пользователя ${user.fullName || user.phone}?`)) {
                              handleRoleChange(user.id, e.target.value);
                            }
                          }}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="STUDENT">Ученик</option>
                          <option value="TEACHER">Учитель</option>
                          <option value="ADMIN">Админ</option>
                          <option value="SUPER_ADMIN">Супер-админ</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Всего</div>
            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-700 mb-1">Ученики</div>
            <div className="text-2xl font-bold text-green-900">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-700 mb-1">Учителя</div>
            <div className="text-2xl font-bold text-blue-900">
              {users.filter(u => u.role === 'TEACHER').length}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 mb-1">Админы</div>
            <div className="text-2xl font-bold text-red-900">
              {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
