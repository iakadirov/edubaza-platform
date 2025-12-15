'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthHeader from '@/components/AuthHeader';
import { Container } from '@/components/ui/container';
import { generateWorksheetTitle } from '@/lib/worksheet-title';
import { formatDate } from '@/lib/date-format';

interface User {
  id: string;
  phone: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  specialty: string | null;
  school: string | null;
  subscriptionPlan: string;
}

interface Worksheet {
  id: string;
  subject: string;
  grade: number;
  topicUz: string;
  config?: {
    quarter?: number;
    week?: number;
  };
  status: string;
  generatedAt: string;
  viewCount: number;
  taskCount: number;
}

const roleLabels: Record<string, string> = {
  STUDENT: 'Oʻquvchi',
  TEACHER: 'Oʻqituvchi',
  PARENT: 'Ota-ona',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super Administrator',
};

const specialtyLabels: Record<string, string> = {
  PRIMARY_SCHOOL: 'Boshlangʻich sinflar (1-4)',
  MATHEMATICS: 'Matematika',
  RUSSIAN_LANGUAGE: 'Rus tili',
  UZBEK_LANGUAGE: 'Oʻzbek tili',
  ENGLISH_LANGUAGE: 'Ingliz tili',
  PHYSICS: 'Fizika',
  CHEMISTRY: 'Kimyo',
  BIOLOGY: 'Biologiya',
  GEOGRAPHY: 'Geografiya',
  HISTORY: 'Tarix',
  LITERATURE: 'Adabiyot',
  INFORMATICS: 'Informatika',
  PHYSICAL_EDUCATION: 'Jismoniy tarbiya',
  MUSIC: 'Musiqa',
  ART: 'Tasviriy sanʻat',
  OTHER: 'Boshqa',
};

const subjectLabels: Record<string, string> = {
  MATHEMATICS: 'Matematika',
  PHYSICS: 'Fizika',
  CHEMISTRY: 'Kimyo',
  BIOLOGY: 'Biologiya',
  RUSSIAN_LANGUAGE: 'Rus tili',
  UZBEK_LANGUAGE: 'Oʻzbek tili',
  ENGLISH_LANGUAGE: 'Ingliz tili',
  HISTORY: 'Tarix',
  GEOGRAPHY: 'Geografiya',
  LITERATURE: 'Adabiyot',
  INFORMATICS: 'Informatika',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [worksheetsLoading, setWorksheetsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    // Serverdan dolzarb ma'lumotlarni yuklaymiz
    fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      })
      .catch(error => {
        console.error('Failed to fetch user data:', error);
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });

    // Topshiriqlarni yuklaymiz
    if (token) {
      fetch('/api/worksheets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setWorksheets(data.data);
          }
        })
        .catch(error => {
          console.error('Failed to fetch worksheets:', error);
        })
        .finally(() => {
          setWorksheetsLoading(false);
        });
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1761FF] border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-['Onest']">Yuklanmoqda...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || 'Foydalanuvchi';

  return (
    <div className="min-h-screen bg-gray-50 font-['Onest']">
      <AuthHeader />

      {/* Main Content */}
      <main className="pt-[124px]">
        {/* Hero Section */}
        <section className="py-12">
          <Container>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Xush kelibsiz, {userName}!
                </h1>
                <p className="text-xl text-gray-600">
                  Bugun qanday material yaratmoqchisiz?
                </p>
              </div>
              <Link
                href="/generate-chat"
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#1761FF] to-[#1451dd] hover:from-[#1451dd] hover:to-[#0d3fb8] text-white rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yangi material yaratish</span>
              </Link>
            </div>
          </Container>
        </section>

        {/* Stats Cards */}
        <section className="py-8">
          <Container>
            <div className="grid md:grid-cols-4 gap-[24px]">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#1761FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{worksheets.length}</div>
                <div className="text-sm text-gray-600">Jami materiallar</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {worksheets.filter(w => w.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Tayyor</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {worksheets.reduce((sum, w) => sum + (w.viewCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Ko'rishlar</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  <span className="bg-gradient-to-r from-[#1761FF] to-[#1451dd] bg-clip-text text-transparent">
                    {user.subscriptionPlan}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Tarif rejasi</div>
              </div>
            </div>
          </Container>
        </section>

        {/* Main Grid */}
        <section className="pb-12">
          <Container>
            <div className="grid lg:grid-cols-3 gap-[24px]">
              {/* Left Column - Worksheets */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Mening materiallarim
                    </h2>
                    <Link
                      href="/generate-chat"
                      className="text-[#1761FF] hover:text-[#1451dd] font-semibold text-sm flex items-center gap-1"
                    >
                      <span>Yangi yaratish</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {worksheetsLoading ? (
                    <div className="text-center py-12">
                      <div className="w-10 h-10 border-4 border-[#1761FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-gray-500">Yuklanmoqda...</div>
                    </div>
                  ) : worksheets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-4 text-lg">Sizda hali materiallar yo'q</p>
                      <Link
                        href="/generate-chat"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1761FF] hover:bg-[#1451dd] text-white rounded-xl font-semibold transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Birinchi material yaratish</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-[24px]">
                      {worksheets.slice(0, 5).map((worksheet) => (
                        <div
                          key={worksheet.id}
                          className="group border border-gray-200 rounded-xl p-4 hover:border-[#1761FF] hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {generateWorksheetTitle(
                                    worksheet.topicUz,
                                    worksheet.subject,
                                    worksheet.grade,
                                    worksheet.config?.quarter,
                                    worksheet.config?.week
                                  )}
                                </h3>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  worksheet.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  worksheet.status === 'GENERATING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {worksheet.status === 'COMPLETED' ? '✓ Tayyor' :
                                   worksheet.status === 'GENERATING' ? '⏳ Yaratilmoqda' : worksheet.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                  {subjectLabels[worksheet.subject] || worksheet.subject}
                                </span>
                                <span>•</span>
                                <span>{worksheet.grade}-sinf</span>
                                <span>•</span>
                                <span>{worksheet.taskCount} ta topshiriq</span>
                                <span>•</span>
                                <span className="text-gray-500">{formatDate(worksheet.generatedAt)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Link
                                href={`/worksheet/${worksheet.id}`}
                                className="px-4 py-2 bg-[#1761FF] hover:bg-[#1451dd] text-white rounded-lg transition-colors text-sm font-medium"
                              >
                                Ochish
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      {worksheets.length > 5 && (
                        <div className="text-center pt-4">
                          <Link
                            href="/worksheets"
                            className="text-[#1761FF] hover:text-[#1451dd] font-semibold text-sm"
                          >
                            Barcha materiallarni ko'rish ({worksheets.length})
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Profile & Quick Actions */}
              <div className="space-y-[24px]">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Profil
                    </h2>
                    <Link
                      href="/profile"
                      className="text-[#1761FF] hover:text-[#1451dd] text-sm font-semibold"
                    >
                      Tahrirlash
                    </Link>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#1761FF] to-[#1451dd] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{userName}</div>
                        <div className="text-sm text-gray-600">{user.phone}</div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rol</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {roleLabels[user.role] || user.role}
                        </span>
                      </div>
                      {user.specialty && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Mutaxassislik</span>
                          <span className="text-sm font-medium text-gray-900 text-right">
                            {specialtyLabels[user.specialty] || user.specialty}
                          </span>
                        </div>
                      )}
                      {user.school && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Maktab</span>
                          <span className="text-sm font-medium text-gray-900 text-right truncate max-w-[180px]">
                            {user.school}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Tezkor havolalar
                  </h2>
                  <div className="space-y-2">
                    <Link
                      href="/generate-chat"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-blue-100 group-hover:bg-[#1761FF] rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-[#1761FF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-[#1761FF] transition-colors">
                        Material yaratish
                      </span>
                    </Link>
                    <Link
                      href="/textbooks"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-green-100 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        Darsliklar
                      </span>
                    </Link>
                    <Link
                      href="/resources"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                        Resurslar
                      </span>
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                        Yordam
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#1761FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Maslahat</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        AI yordamchi yordamida soniyalar ichida professional materiallar yarating!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
