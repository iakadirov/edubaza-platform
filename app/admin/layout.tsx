'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

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
        <div className="text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Asosiy',
      items: [
        { href: '/admin', label: 'Boshqaruv paneli', icon: 'solar:chart-line-duotone', activeIcon: 'solar:chart-bold-duotone' },
      ],
    },
    {
      title: 'Kontent',
      items: [
        { href: '/admin/structure', label: 'Tuzilma', icon: 'solar:buildings-2-line-duotone', activeIcon: 'solar:buildings-2-bold-duotone' },
        { href: '/admin/content', label: 'Kutubxona', icon: 'solar:book-2-line-duotone', activeIcon: 'solar:book-2-bold-duotone' },
        { href: '/admin/worksheets', label: 'Ish varaqalari', icon: 'solar:document-line-duotone', activeIcon: 'solar:document-bold-duotone' },
      ],
    },
    {
      title: 'Foydalanuvchilar',
      items: [
        { href: '/admin/users', label: 'Foydalanuvchilar', icon: 'solar:users-group-rounded-line-duotone', activeIcon: 'solar:users-group-rounded-bold-duotone' },
      ],
    },
    {
      title: 'Tizim',
      items: [
        { href: '/admin/subscription-plans', label: 'Tariflar', icon: 'solar:card-line-duotone', activeIcon: 'solar:card-bold-duotone' },
        { href: '/admin/settings', label: 'Sozlamalar', icon: 'solar:settings-line-duotone', activeIcon: 'solar:settings-bold-duotone' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F4F4F6' }}>
      {/* Sidebar */}
      <aside className="w-[280px] flex-shrink-0 p-5">
        <div className="h-full flex flex-col">
          {/* Logo & Brand */}
          <div className="px-4 py-6">
            <Link href="/dashboard" className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Icon icon="solar:book-bold" className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Edubaza</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          {user && (
            <div className="mx-4 mb-6 p-3 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {(user.fullName || user.phone || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName || user.phone}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2">
            <div className="space-y-6">
              {menuItems.map((group) => (
                <div key={group.title}>
                  <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                            group w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3
                            ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-gray-700 hover:bg-white hover:shadow-sm'
                            }
                          `}
                        >
                          <Icon
                            icon={item.icon.replace('line-duotone', 'bold-duotone')}
                            className={`text-xl transition-transform group-hover:scale-110 ${
                              isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                            }`}
                          />
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
          <div className="px-2 pt-4 mt-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-xl transition-all"
            >
              <Icon
                icon="solar:logout-2-bold-duotone"
                className="text-xl text-gray-400 group-hover:text-red-500 transition-colors"
              />
              <span>Bosh sahifaga qaytish</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div
          className="bg-white rounded-xl shadow-sm min-h-full"
          style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
