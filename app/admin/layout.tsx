'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
        router.push('/dashboard');
      } else {
        setUser(data.user);
        setLoading(false);
      }
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Главная',
      items: [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      title: 'Контент',
      items: [
        { href: '/admin/structure', label: 'Структура', icon: '🏗️' },
        { href: '/admin/content', label: 'Библиотека', icon: '📚' },
      ],
    },
    {
      title: 'Пользователи',
      items: [
        { href: '/admin/users', label: 'Пользователи', icon: '👥' },
      ],
    },
    {
      title: 'Система',
      items: [
        { href: '/admin/settings', label: 'Настройки', icon: '⚙️' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="sticky top-0 h-screen flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
              <span>←</span>
              <span>На главную</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mt-3">
              Admin Panel
            </h1>
            {user && (
              <p className="text-xs text-gray-500 mt-1">
                {user.fullName || user.phone}
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {menuItems.map((group) => (
                <div key={group.title}>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 block
                            ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <Link
              href="/dashboard"
              className="block text-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Выйти из админки
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
