'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const subjects = [
  { value: 'MATHEMATICS', label: 'Matematika' },
  { value: 'PHYSICS', label: 'Fizika' },
  { value: 'CHEMISTRY', label: 'Kimyo' },
  { value: 'BIOLOGY', label: 'Biologiya' },
  { value: 'RUSSIAN_LANGUAGE', label: 'Rus tili' },
  { value: 'UZBEK_LANGUAGE', label: 'Oʻzbek tili' },
  { value: 'ENGLISH_LANGUAGE', label: 'Ingliz tili' },
  { value: 'HISTORY', label: 'Tarix' },
  { value: 'GEOGRAPHY', label: 'Geografiya' },
  { value: 'LITERATURE', label: 'Adabiyot' },
  { value: 'INFORMATICS', label: 'Informatika' },
];

const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const taskCounts = [5, 10, 15, 20];

const difficulties = [
  { value: 'EASY', label: 'Oson' },
  { value: 'MEDIUM', label: 'Oʻrta' },
  { value: 'HARD', label: 'Qiyin' },
];

const taskTypes = [
  { value: 'TEST', label: 'Testlar (javob tanlash)' },
  { value: 'PROBLEM', label: 'Masalalar (yechim bilan)' },
  { value: 'QUESTION', label: 'Savollar (ochiq)' },
  { value: 'FILL_BLANK', label: 'Boʻsh joyni toʻldirish' },
];

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [subject, setSubject] = useState('MATHEMATICS');
  const [grade, setGrade] = useState(5);
  const [topic, setTopic] = useState('');
  const [taskCount, setTaskCount] = useState(10);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>(['TEST', 'PROBLEM']);
  const language = 'uz-latn'; // Fixed to Uzbek Latin

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleTaskTypeToggle = (type: string) => {
    if (selectedTaskTypes.includes(type)) {
      setSelectedTaskTypes(selectedTaskTypes.filter(t => t !== type));
    } else {
      setSelectedTaskTypes([...selectedTaskTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация
    if (!topic.trim()) {
      setError('Iltimos, dars mavzusini kiriting');
      return;
    }

    if (selectedTaskTypes.length === 0) {
      setError('Kamida bitta topshiriq turini tanlang');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          grade,
          topic,
          taskCount,
          difficulty,
          taskTypes: selectedTaskTypes,
          language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Topshiriqlar muvaffaqiyatli yaratildi!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Topshiriqlar yaratishda xatolik');
      }
    } catch (err) {
      setError('Server bilan bog\'lanishda xatolik');
      console.error('Generate error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduBaza.uz
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Topshiriqlar yaratish
          </h1>
          <p className="text-gray-600 mb-8">
            Oʻquv materiallari yaratish uchun parametrlarni toʻldiring
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject and Grade */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fan *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  {subjects.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sinf *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  {grades.map(g => (
                    <option key={g} value={g}>{g}-sinf</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dars mavzusi *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: Kvadrat tenglamalar, Nyuton qonunlari, Sifatdosh"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Topshiriqlar yaratish uchun aniq mavzu kiriting
              </p>
            </div>

            {/* Task Count and Difficulty */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topshiriqlar soni *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {taskCounts.map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setTaskCount(count)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        taskCount === count
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qiyinlik darajasi *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  {difficulties.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topshiriq turlari * (bir nechtasini tanlang)
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {taskTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTaskTypeToggle(type.value)}
                    className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                      selectedTaskTypes.includes(type.value)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">
                      {selectedTaskTypes.includes(type.value) ? '✓' : '○'}
                    </span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Topshiriqlar yaratilmoqda...
                  </span>
                ) : (
                  'Topshiriqlar yaratish'
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-3">
                Yaratish 30-60 soniya davom etadi
              </p>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Maslahat</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Mavzu qanchalik aniq boʻlsa, natija shuncha yaxshi boʻladi</li>
            <li>• Turli xil topshiriq turlarini birlashtirish mumkin</li>
            <li>• Yaratilgandan keyin topshiriqlarni tahrirlash mumkin</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
