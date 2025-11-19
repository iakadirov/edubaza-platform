'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface Stats {
  grades: number;
  subjects: number;
  topics: number;
  materials: number;
  users: number;
  teachers: number;
  students: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stats data:', data);
        setStats(data);
      } else {
        const error = await response.json();
        console.error('Stats API error:', error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panelga xush kelibsiz
          </h1>
          <p className="text-gray-600">Platformani boshqarish markazi</p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Structure Card */}
          <Link
            href="/admin/structure"
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-blue-500"
          >
            <div className="flex items-center mb-3">
              <Icon
                icon="solar:buildings-2-line-duotone"
                className="text-4xl mr-3 text-blue-500 group-hover:hidden"
              />
              <Icon
                icon="solar:buildings-2-bold-duotone"
                className="text-4xl mr-3 text-blue-500 hidden group-hover:block"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Tuzilma
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Sinflar, fanlar va mavzular
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Sinflar
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Fanlar
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Mavzular
              </span>
            </div>
          </Link>

          {/* Content Library Card */}
          <Link
            href="/admin/content"
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-green-500"
          >
            <div className="flex items-center mb-3">
              <Icon
                icon="solar:book-2-line-duotone"
                className="text-4xl mr-3 text-green-500 group-hover:hidden"
              />
              <Icon
                icon="solar:book-2-bold-duotone"
                className="text-4xl mr-3 text-green-500 hidden group-hover:block"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Kutubxona
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Barcha o'quv materiallari bir joyda
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Topshiriqlar
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Testlar
              </span>
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs">
                Materiallar
              </span>
            </div>
          </Link>

          {/* Users Card */}
          <Link
            href="/admin/users"
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-purple-500"
          >
            <div className="flex items-center mb-3">
              <Icon
                icon="solar:users-group-rounded-line-duotone"
                className="text-4xl mr-3 text-purple-500 group-hover:hidden"
              />
              <Icon
                icon="solar:users-group-rounded-bold-duotone"
                className="text-4xl mr-3 text-purple-500 hidden group-hover:block"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Foydalanuvchilar
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Foydalanuvchilar va kirishni boshqarish
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                O'qituvchilar
              </span>
              <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
                O'quvchilar
              </span>
            </div>
          </Link>

          {/* Subscription Plans Card */}
          <Link
            href="/admin/subscription-plans"
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-yellow-500"
          >
            <div className="flex items-center mb-3">
              <Icon
                icon="solar:card-line-duotone"
                className="text-4xl mr-3 text-yellow-500 group-hover:hidden"
              />
              <Icon
                icon="solar:card-bold-duotone"
                className="text-4xl mr-3 text-yellow-500 hidden group-hover:block"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Tariflar
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Tarif rejalarini boshqarish
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                Beminnat
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Ustoz
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                Katta ustoz
              </span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Maktab
              </span>
            </div>
          </Link>

          {/* Settings Card */}
          <Link
            href="/admin/settings"
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 hover:border-orange-500"
          >
            <div className="flex items-center mb-3">
              <Icon
                icon="solar:settings-line-duotone"
                className="text-4xl mr-3 text-orange-500 group-hover:hidden"
              />
              <Icon
                icon="solar:settings-bold-duotone"
                className="text-4xl mr-3 text-orange-500 hidden group-hover:block"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Sozlamalar
                </h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Tizim konfiguratsiyasi va integratsiyalar
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                Umumiy
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                AI & SMS
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                Xavfsizlik
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tezkor statistika
          </h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Statistika yuklanmoqda...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats?.grades || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Sinflar</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">{stats?.subjects || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Fanlar</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{stats?.topics || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Mavzular</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{stats?.materials || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Materiallar</div>
              </div>
            </div>
          )}
        </div>

        {/* User Stats */}
        {!loading && stats && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Foydalanuvchilar
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="text-2xl font-bold text-indigo-600">{stats.users || 0}</div>
                <div className="text-xs text-gray-600 mt-1">Jami</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-100">
                <div className="text-2xl font-bold text-teal-600">{stats.teachers || 0}</div>
                <div className="text-xs text-gray-600 mt-1">O'qituvchilar</div>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="text-2xl font-bold text-cyan-600">{stats.students || 0}</div>
                <div className="text-xs text-gray-600 mt-1">O'quvchilar</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
