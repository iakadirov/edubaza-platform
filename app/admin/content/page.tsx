'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/components/admin/PageHeader';

interface ContentStats {
  tasks: {
    total: number;
    ai: number;
    db: number;
    pending: number;
  };
  lessons: {
    total: number;
  };
  resources: {
    total: number;
  };
  books: {
    total: number;
  };
  categories: {
    total: number;
  };
}

export default function AdminContentOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContentStats>({
    tasks: { total: 0, ai: 0, db: 0, pending: 0 },
    lessons: { total: 0 },
    resources: { total: 0 },
    books: { total: 0 },
    categories: { total: 0 },
  });

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
        loadStats();
      }
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/');
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Load tasks stats using existing API
      const tasksResponse = await fetch('/api/content/items?type=TASK', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasksData = await tasksResponse.json();

      // Load books stats
      const booksResponse = await fetch('/api/library/books?limit=1', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const booksData = await booksResponse.json();

      // Load categories stats
      const categoriesResponse = await fetch('/api/library/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const categoriesData = await categoriesResponse.json();

      if (tasksData.success) {
        const tasks = tasksData.data;
        setStats({
          tasks: {
            total: tasks.length,
            ai: tasks.filter((t: any) => t.metadata?.isAiGenerated).length,
            db: tasks.filter((t: any) => !t.metadata?.isAiGenerated).length,
            pending: tasks.filter((t: any) => t.metadata?.isAiGenerated && !t.metadata?.approved).length,
          },
          lessons: { total: 0 }, // TODO: Implement
          resources: { total: 0 }, // TODO: Implement
          books: { total: booksData.success ? booksData.pagination?.total || 0 : 0 },
          categories: { total: categoriesData.success ? categoriesData.data.length : 0 },
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const contentSections = [
    {
      id: 'tasks',
      title: 'Topshiriqlar',
      description: 'Test savollari va mashqlar',
      icon: 'solar:document-text-bold-duotone',
      href: '/admin/content/tasks',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      stats: [
        { label: 'Jami', value: stats.tasks.total, icon: 'solar:checklist-bold' },
        { label: 'AI yaratgan', value: stats.tasks.ai, icon: 'solar:magic-stick-3-bold' },
        { label: 'Darslikdan', value: stats.tasks.db, icon: 'solar:book-bold' },
        { label: 'Kutilmoqda', value: stats.tasks.pending, icon: 'solar:clock-circle-bold', alert: stats.tasks.pending > 0 },
      ],
      available: true,
    },
    {
      id: 'lessons',
      title: 'Dars rejalari',
      description: 'Tayyor darslar va prezentatsiyalar',
      icon: 'solar:clipboard-list-bold-duotone',
      href: '/admin/content/lessons',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      stats: [
        { label: 'Jami', value: stats.lessons.total, icon: 'solar:clipboard-check-bold' },
      ],
      available: false,
      comingSoon: true,
    },
    {
      id: 'resources',
      title: 'Materiallar',
      description: 'Video darslar, metodichkalar, PDF fayllar',
      icon: 'solar:folder-with-files-bold-duotone',
      href: '/admin/content/resources',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      stats: [
        { label: 'Jami', value: stats.resources.total, icon: 'solar:file-bold' },
      ],
      available: false,
      comingSoon: true,
    },
    {
      id: 'books',
      title: 'Elektron kitoblar',
      description: 'Darsliklar va qoʻllanmalar',
      icon: 'solar:book-bookmark-bold-duotone',
      href: '/admin/content/books',
      color: 'orange',
      gradient: 'from-orange-500 to-red-500',
      stats: [
        { label: 'Jami', value: stats.books.total, icon: 'solar:book-2-bold' },
      ],
      available: true,
      comingSoon: false,
    },
    {
      id: 'categories',
      title: 'Kategoriyalar',
      description: 'Kitoblar uchun kategoriyalar va bo\'limlar',
      icon: 'solar:folder-with-files-bold-duotone',
      href: '/admin/content/categories',
      color: 'teal',
      gradient: 'from-teal-500 to-cyan-500',
      stats: [
        { label: 'Jami', value: stats.categories.total, icon: 'solar:folder-bold' },
      ],
      available: true,
      comingSoon: false,
    },
  ];

  return (
    <>
      <PageHeader
        icon="solar:library-bold-duotone"
        title="Kontent kutubxonasi"
        subtitle="Barcha oʻquv materiallari bir joyda"
        backHref="/admin"
      />

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:refresh-circle-bold-duotone" className="text-6xl text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentSections.map((section) => (
              <Link
                key={section.id}
                href={section.available ? section.href : '#'}
                className={`group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
                  !section.available ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={(e) => {
                  if (!section.available) {
                    e.preventDefault();
                  }
                }}
              >
                {/* Gradient Header */}
                <div className={`h-1.5 bg-gradient-to-r ${section.gradient}`} />

                <div className="p-5">
                  {/* Title & Icon */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 bg-gradient-to-br ${section.gradient} rounded-lg`}>
                        <Icon icon={section.icon} className="text-2xl text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {section.title}
                        </h2>
                        <p className="text-xs text-gray-600 mt-0.5">{section.description}</p>
                      </div>
                    </div>
                    {section.available && (
                      <Icon
                        icon="solar:arrow-right-bold-duotone"
                        className="text-xl text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                      />
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2.5 mt-4">
                    {section.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-colors ${
                          stat.alert
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50 group-hover:border-blue-200 group-hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Icon
                            icon={stat.icon}
                            className={`text-base ${
                              stat.alert ? 'text-yellow-600' : 'text-gray-500 group-hover:text-blue-600'
                            }`}
                          />
                          <span className="text-xs font-medium text-gray-600">{stat.label}</span>
                        </div>
                        <div
                          className={`text-xl font-bold ${
                            stat.alert ? 'text-yellow-700' : 'text-gray-900'
                          }`}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coming Soon Badge */}
                  {section.comingSoon && (
                    <div className="mt-4 flex items-center justify-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        <Icon icon="solar:clock-circle-bold" className="text-lg" />
                        Tez orada
                      </span>
                    </div>
                  )}

                  {/* Quick Actions for Available Sections */}
                  {section.available && section.id === 'tasks' && stats.tasks.pending > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link
                        href="/admin/content/tasks?filter=AI&status=PENDING"
                        className="flex items-center justify-between px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group/action"
                      >
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:danger-triangle-bold" className="text-lg text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-700">
                            {stats.tasks.pending} ta topshiriq tasdiqlash kutmoqda
                          </span>
                        </div>
                        <Icon
                          icon="solar:arrow-right-bold"
                          className="text-yellow-600 group-hover/action:translate-x-1 transition-transform"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>

      {/* Quick Stats Overview */}
      {!loading && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="solar:chart-2-bold-duotone" className="text-xl text-blue-600" />
              Umumiy statistika
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.tasks.total + stats.lessons.total + stats.resources.total + stats.books.total}
                </div>
                <div className="text-sm text-gray-600 mt-1">Jami kontentlar</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{stats.tasks.ai}</div>
                <div className="text-sm text-gray-600 mt-1">AI yaratgan</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{stats.tasks.db}</div>
                <div className="text-sm text-gray-600 mt-1">Darslikdan</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-yellow-600">{stats.tasks.pending}</div>
                <div className="text-sm text-gray-600 mt-1">Tasdiqlash kerak</div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
