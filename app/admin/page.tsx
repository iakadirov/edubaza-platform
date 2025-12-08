'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/admin/PageHeader';

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
    <>
      <PageHeader
        icon="solar:widget-bold-duotone"
        title="Boshqaruv paneli"
        subtitle="Platformani boshqarish markazi"
      />

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Structure Card */}
        <Link href="/admin/structure" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  icon="solar:buildings-2-bold-duotone"
                  className="text-4xl text-blue-500 transition-transform group-hover:scale-110"
                />
                <CardTitle className="text-xl">Tuzilma</CardTitle>
              </div>
              <CardDescription>Sinflar, fanlar va mavzular</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Sinflar</Badge>
                <Badge variant="secondary">Fanlar</Badge>
                <Badge variant="secondary">Mavzular</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Content Library Card */}
        <Link href="/admin/content" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-green-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  icon="solar:book-2-bold-duotone"
                  className="text-4xl text-green-500 transition-transform group-hover:scale-110"
                />
                <CardTitle className="text-xl">Kutubxona</CardTitle>
              </div>
              <CardDescription>Barcha o'quv materiallari bir joyda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Topshiriqlar</Badge>
                <Badge variant="secondary">Testlar</Badge>
                <Badge variant="secondary">Materiallar</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Users Card */}
        <Link href="/admin/users" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-purple-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  className="text-4xl text-purple-500 transition-transform group-hover:scale-110"
                />
                <CardTitle className="text-xl">Foydalanuvchilar</CardTitle>
              </div>
              <CardDescription>Foydalanuvchilar va kirishni boshqarish</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">O'qituvchilar</Badge>
                <Badge variant="secondary">O'quvchilar</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Subscription Plans Card */}
        <Link href="/admin/subscription-plans" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-yellow-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  icon="solar:card-bold-duotone"
                  className="text-4xl text-yellow-500 transition-transform group-hover:scale-110"
                />
                <CardTitle className="text-xl">Tariflar</CardTitle>
              </div>
              <CardDescription>Tarif rejalarini boshqarish</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Beminnat</Badge>
                <Badge variant="secondary">Ustoz</Badge>
                <Badge variant="secondary">Katta ustoz</Badge>
                <Badge variant="secondary">Maktab</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Settings Card */}
        <Link href="/admin/settings" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-orange-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  icon="solar:settings-bold-duotone"
                  className="text-4xl text-orange-500 transition-transform group-hover:scale-110"
                />
                <CardTitle className="text-xl">Sozlamalar</CardTitle>
              </div>
              <CardDescription>Tizim konfiguratsiyasi va integratsiyalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Umumiy</Badge>
                <Badge variant="secondary">AI & SMS</Badge>
                <Badge variant="secondary">Xavfsizlik</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Tezkor statistika</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Statistika yuklanmoqda...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{stats?.grades || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Sinflar</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">{stats?.subjects || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Fanlar</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-2xl font-bold text-purple-600">{stats?.topics || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Mavzular</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{stats?.materials || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Materiallar</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Stats */}
      {!loading && stats && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Foydalanuvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="text-2xl font-bold text-indigo-600">{stats.users || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Jami</div>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-100">
                <div className="text-2xl font-bold text-teal-600">{stats.teachers || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">O'qituvchilar</div>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                <div className="text-2xl font-bold text-cyan-600">{stats.students || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">O'quvchilar</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
