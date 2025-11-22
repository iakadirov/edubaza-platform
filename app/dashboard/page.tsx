'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                EduBaza.uz ga xush kelibsiz!
              </h1>
              <p className="text-gray-600 mt-1">
                Boshqaruv paneli
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/generate"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-lg transform hover:scale-105"
              >
                ✨ Topshiriq yaratish
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Foydalanuvchi ma'lumotlari
            </h2>
            <Link
              href="/profile"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Profilni tahrirlash
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Telefon:</span>
              <span className="text-gray-900 font-semibold">{user.phone}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">F.I.SH:</span>
              <span className="text-gray-900 font-semibold">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name || 'Ko\'rsatilmagan'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Rol:</span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                {roleLabels[user.role] || user.role}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Mutaxassislik:</span>
              <span className="text-gray-900 font-medium">{user.specialty ? specialtyLabels[user.specialty] || user.specialty : 'Koʻrsatilmagan'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Maktab:</span>
              <span className="text-gray-900 font-medium">{user.school || 'Koʻrsatilmagan'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 w-40">Tarif rejasi:</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {user.subscriptionPlan}
              </span>
            </div>
          </div>
        </div>

        {/* My Worksheets */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Mening topshiriqlarim
          </h2>

          {worksheetsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Yuklanmoqda...
            </div>
          ) : worksheets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Sizda hali yaratilgan topshiriqlar yoʻq</p>
              <Link
                href="/generate"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Birinchi topshiriq yaratish
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {worksheets.map((worksheet) => (
                <div
                  key={worksheet.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {generateWorksheetTitle(
                            worksheet.topicUz,
                            worksheet.subject,
                            worksheet.grade,
                            worksheet.config?.quarter,
                            worksheet.config?.week
                          )}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          worksheet.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          worksheet.status === 'GENERATING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {worksheet.status === 'COMPLETED' ? 'Tayyor' :
                           worksheet.status === 'GENERATING' ? 'Yaratilmoqda' : worksheet.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{subjectLabels[worksheet.subject] || worksheet.subject}</span>
                        <span>•</span>
                        <span>{worksheet.grade}-sinf</span>
                        <span>•</span>
                        <span>{worksheet.taskCount} ta topshiriq</span>
                        <span>•</span>
                        <span>{formatDate(worksheet.generatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/worksheet/${worksheet.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Ochish
                      </Link>
                      <button
                        onClick={() => window.open(`/worksheet/${worksheet.id}`, '_blank')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        Chop etish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>Muvaffaqiyatli avtorizatsiya!</strong> Siz SMS OTP orqali tizimga kirdingiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
