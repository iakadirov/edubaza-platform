'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/user/check-admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!data.isAdmin) {
        router.push('/');
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">Platformani boshqarish markazi</p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Structure Card */}
          <Link
            href="/admin/structure"
            className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-8 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-5xl mr-4">🏗️</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Tuzilma
                </h2>
                <p className="text-sm text-gray-600">Dastur tuzilmasi</p>
              </div>
            </div>
            <p className="text-gray-600">
              Sinflar, fanlar va mavzularni boshqarish
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Sinflar
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                Fanlar
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                Mavzular
              </span>
            </div>
          </Link>

          {/* Content Library Card */}
          <Link
            href="/admin/content"
            className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-8 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center mb-4">
              <div className="text-5xl mr-4">📚</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Kutubxona
                </h2>
                <p className="text-sm text-gray-600">Kontent kutubxonasi</p>
              </div>
            </div>
            <p className="text-gray-600">
              Barcha oʻquv materiallari bir joyda
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                Masalalar
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Testlar
              </span>
              <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                Materiallar
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Tezkor statistika
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Sinflar</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">Fanlar</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-600">Mavzular</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">-</div>
              <div className="text-sm text-gray-600">Materiallar</div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
