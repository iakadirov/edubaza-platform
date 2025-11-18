'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface UserProfile {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  specialty: string | null;
  school: string | null;
  subscriptionPlan: string;
  planInfo?: {
    planCode: string;
    nameUz: string;
    nameRu: string;
    priceUzs: number;
    features: Record<string, any>;
    limits: Record<string, any>;
    showWatermark: boolean;
  };
  usage?: {
    worksheetsThisMonth: number;
  };
}

const specialtyLabels: Record<string, string> = {
  PRIMARY_SCHOOL: 'Boshlang\'ich sinflar (1-4)',
  MATHEMATICS: 'Matematika',
  RUSSIAN_LANGUAGE: 'Rus tili',
  UZBEK_LANGUAGE: 'O\'zbek tili',
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
  ART: 'Tasviriy san\'at',
  OTHER: 'Boshqa',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);
        setName(data.data.name || '');
        setSpecialty(data.data.specialty || '');
        setSchool(data.data.school || '');
      } else {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || null,
          specialty: specialty || null,
          school: school.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);
        setMessage({ type: 'success', text: 'Profil muvaffaqiyatli yangilandi!' });

        // Обновляем localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.name = data.data.name;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Profilni yangilashda xatolik' });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: 'Server xatoligi' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-gray-600">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
            <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
            <span>Boshqaruv paneliga qaytish</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Mening profilim</h1>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="text"
                value={profile.phone}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 font-semibold cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                F.I.SH <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ivanov Ivan Ivanovich"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mutaxassislik
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Mutaxassislikni tanlang</option>
                {Object.entries(specialtyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maktab
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="1-maktab, Toshkent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
            </button>
          </form>
        </div>

        {/* Subscription Plan Info */}
        {profile.planInfo && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Obuna rejasi</h2>

            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div>
                <h3 className="text-xl font-bold text-blue-800">{profile.planInfo.nameUz}</h3>
                <p className="text-sm text-gray-600">{profile.planInfo.nameRu}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {profile.planInfo.priceUzs.toLocaleString()} so'm
                </p>
                <p className="text-sm text-gray-600">oyiga</p>
              </div>
            </div>

            {/* Limits & Usage */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Icon icon="solar:chart-square-bold-duotone" className="text-xl text-blue-600" />
                Limitlar va foydalanish
              </h4>

              {/* Worksheets limit */}
              {profile.planInfo.limits.worksheetsPerMonth !== undefined && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:document-text-bold-duotone" className="text-lg text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Ishchi varaqlar (oylik)</span>
                  </div>
                  <div className="text-right">
                    {profile.planInfo.limits.worksheetsPerMonth === -1 ? (
                      <span className="text-sm font-bold text-green-600">Cheksiz</span>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-blue-600">
                          {profile.usage?.worksheetsThisMonth || 0} / {profile.planInfo.limits.worksheetsPerMonth}
                        </span>
                        <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                ((profile.usage?.worksheetsThisMonth || 0) / profile.planInfo.limits.worksheetsPerMonth) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Saved worksheets limit */}
              {profile.planInfo.limits.savedWorksheets !== undefined && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:folder-with-files-bold-duotone" className="text-lg text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Saqlangan varaqlar</span>
                  </div>
                  <div className="text-right">
                    {profile.planInfo.limits.savedWorksheets === -1 ? (
                      <span className="text-sm font-bold text-green-600">Cheksiz</span>
                    ) : (
                      <span className="text-sm font-bold text-gray-700">{profile.planInfo.limits.savedWorksheets} tagacha</span>
                    )}
                  </div>
                </div>
              )}

              {/* Watermark */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:waterdrops-bold-duotone" className="text-lg text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Suv belgisi</span>
                </div>
                <div className="text-right">
                  {profile.planInfo.showWatermark ? (
                    <span className="text-sm text-orange-600">Mavjud</span>
                  ) : (
                    <span className="text-sm font-bold text-green-600">Yo'q</span>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            {profile.planInfo.features && Object.keys(profile.planInfo.features).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Icon icon="solar:star-bold-duotone" className="text-xl text-yellow-500" />
                  Imkoniyatlar
                </h4>
                <div className="space-y-2">
                  {Object.entries(profile.planInfo.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {value === true ? (
                          <Icon icon="solar:check-circle-bold-duotone" className="text-xl text-green-500" />
                        ) : (
                          <Icon icon="solar:close-circle-bold-duotone" className="text-xl text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">{key}</span>
                      </div>
                      <div className="text-right">
                        {value === true ? (
                          <span className="text-sm font-bold text-green-600">Faol</span>
                        ) : (
                          <span className="text-sm text-gray-500">Faol emas</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
