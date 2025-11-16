'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopicAutocomplete from '../admin/content/TopicAutocomplete';

interface Grade {
  number: number;
  nameUz: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  code: string;
  nameUz: string;
  descriptionUz?: string;
  icon: string;
  color: string;
}

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  quarter: number | null;
  keywords: string[];
  subject: {
    code: string;
    nameUz: string;
  };
}

const difficulties = [
  { value: 'MIX', label: 'Aralash' },
  { value: 'EASY', label: 'Oson' },
  { value: 'MEDIUM', label: 'Oʻrta' },
  { value: 'HARD', label: 'Qiyin' },
];

const taskTypes = [
  { value: 'MIX', label: '🎲 Aralash (barcha turlar)' },
  { value: 'SINGLE_CHOICE', label: '☑️ Bir tanlov (bitta toʻgʻri javob)' },
  { value: 'MULTIPLE_CHOICE', label: '✅ Koʻp tanlov (bir nechta toʻgʻri javob)' },
  { value: 'TRUE_FALSE', label: '✓✗ Toʻgʻri/Notoʻgʻri' },
  { value: 'SHORT_ANSWER', label: '✍️ Qisqa javob' },
  { value: 'FILL_BLANKS', label: '___ Boʻshliqlarni toʻldirish' },
  { value: 'MATCHING', label: '🔗 Moslashtirish' },
  { value: 'ESSAY', label: '📝 Kengaytirilgan javob' },
];

export default function GenerateV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data from API
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form state
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectionMode, setSelectionMode] = useState<'topic' | 'quarter'>('topic');
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [taskCount, setTaskCount] = useState(10);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['MIX']);
  const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>(['MIX']);
  const language = 'uz-latn';

  // Loading states
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Load grades on mount
  useEffect(() => {
    loadGrades();
  }, []);

  // Load subjects when grade changes
  useEffect(() => {
    if (selectedGrade) {
      loadSubjects(selectedGrade);
    }
  }, [selectedGrade]);

  const loadGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      }
    } catch (error) {
      console.error('Failed to load grades:', error);
    }
  };

  const loadSubjects = async (grade: number) => {
    setLoadingSubjects(true);
    try {
      const response = await fetch(`/api/subjects?grade=${grade}`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
        // Auto-select first subject if available
        if (data.data.length > 0 && !selectedSubject) {
          setSelectedSubject(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleTaskTypeToggle = (type: string) => {
    if (type === 'MIX') {
      setSelectedTaskTypes(['MIX']);
    } else {
      const newTypes = selectedTaskTypes.filter(t => t !== 'MIX');
      if (newTypes.includes(type)) {
        const filtered = newTypes.filter(t => t !== type);
        setSelectedTaskTypes(filtered.length === 0 ? ['MIX'] : filtered);
      } else {
        setSelectedTaskTypes([...newTypes, type]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedSubject) {
      setError('Iltimos, fanni tanlang');
      return;
    }

    if (selectionMode === 'topic' && !selectedTopic) {
      setError('Iltimos, mavzuni tanlang');
      return;
    }

    if (selectionMode === 'quarter' && !selectedQuarter) {
      setError('Iltimos, chorakni tanlang');
      return;
    }

    if (selectedTaskTypes.length === 0) {
      setError('Kamida bitta topshiriq turini tanlang');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Determine difficulty and taskTypes to send
      const difficultyToSend = selectedDifficulties.includes('MIX') ? 'ALL' : selectedDifficulties;
      const taskTypesToSend = selectedTaskTypes.includes('MIX')
        ? ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANKS', 'MATCHING', 'ESSAY']
        : selectedTaskTypes;

      const requestBody: any = {
        subject: selectedSubject.code,
        grade: selectedGrade,
        taskCount,
        difficulty: Array.isArray(difficultyToSend) && difficultyToSend.length === 1 ? difficultyToSend[0] : 'ALL',
        taskTypes: taskTypesToSend,
        language,
      };

      if (selectionMode === 'topic') {
        requestBody.topicId = selectedTopic?.id;
        requestBody.topic = selectedTopic?.titleUz || '';
      } else {
        requestBody.quarter = selectedQuarter;
        if (selectedWeek) {
          requestBody.week = selectedWeek;
        }
      }

      const response = await fetch('/api/worksheets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Topshiriq muvaffaqiyatli yaratildi!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(data.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      setError('Server bilan bog\'lanishda xatolik');
      console.error('Generate error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Topshiriq yaratish
            </h1>
            <p className="text-gray-600 mt-1">AI yordamida yangi topshiriq yarating</p>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Ortga
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Grade Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              1. Sinfni tanlang
            </label>
            <div className="grid grid-cols-11 gap-2">
              {grades.map((g) => (
                <button
                  key={g.number}
                  type="button"
                  onClick={() => {
                    setSelectedGrade(g.number);
                    setSelectedSubject(null);
                    setSelectedTopic(null);
                  }}
                  className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                    selectedGrade === g.number
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {g.number}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Subject Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              2. Fanni tanlang
            </label>
            {loadingSubjects ? (
              <div className="text-center py-8 text-gray-500">Yuklanmoqda...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(s);
                      setSelectedTopic(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedSubject?.id === s.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{s.nameUz}</div>
                        {s.descriptionUz && (
                          <div className="text-xs text-gray-500">{s.descriptionUz}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Topic or Quarter/Week Selection */}
          {selectedSubject && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                3. Filtr turini tanlang
              </label>

              {/* Toggle between topic and quarter */}
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectionMode('topic')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectionMode === 'topic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aniq mavzu
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('quarter')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectionMode === 'quarter'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Chorak / Hafta
                </button>
              </div>

              {selectionMode === 'topic' ? (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Mavzuni qidiring
                  </label>
                  <TopicAutocomplete
                    value={selectedTopic?.id || ''}
                    onChange={async (topicId) => {
                      // Fetch the topic details
                      if (topicId) {
                        try {
                          const response = await fetch(`/api/topics`);
                          const data = await response.json();
                          if (data.success) {
                            const topic = data.data.find((t: Topic) => t.id === topicId);
                            setSelectedTopic(topic || null);
                          }
                        } catch (error) {
                          console.error('Failed to fetch topic:', error);
                        }
                      } else {
                        setSelectedTopic(null);
                      }
                    }}
                    placeholder="Mavzu nomini kiriting..."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quarter Selection */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Chorakni tanlang
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSelectedQuarter(q)}
                          className={`py-2 rounded-lg font-semibold transition-all ${
                            selectedQuarter === q
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {q}-chorak
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Week Selection (Optional) */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Hafta (ixtiyoriy)
                    </label>
                    <select
                      value={selectedWeek || ''}
                      onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Barcha haftalar</option>
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => (
                        <option key={week} value={week}>
                          {week}-hafta
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rest of the form: Task Count, Difficulty, Task Types */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Task Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Topshiriqlar soni
              </label>
              <select
                value={taskCount}
                onChange={(e) => setTaskCount(parseInt(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((count) => (
                  <option key={count} value={count}>
                    {count} ta topshiriq
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Qiyinlik darajasi
              </label>
              <div className="space-y-2">
                {difficulties.map((d) => (
                  <label
                    key={d.value}
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-gray-100"
                  >
                    <input
                      type="checkbox"
                      value={d.value}
                      checked={selectedDifficulties.includes(d.value)}
                      onChange={() => {
                        if (d.value === 'MIX') {
                          setSelectedDifficulties(['MIX']);
                        } else {
                          const newDifficulties = selectedDifficulties.filter(diff => diff !== 'MIX');
                          if (newDifficulties.includes(d.value)) {
                            const filtered = newDifficulties.filter(diff => diff !== d.value);
                            setSelectedDifficulties(filtered.length === 0 ? ['MIX'] : filtered);
                          } else {
                            setSelectedDifficulties([...newDifficulties, d.value]);
                          }
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{d.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Task Types */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Topshiriq turlari (kamida bitta)
            </label>
            <div className="space-y-2">
              {taskTypes.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskTypes.includes(type.value)}
                    onChange={() => handleTaskTypeToggle(type.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Yaratilmoqda...' : '✨ Topshiriq yaratish'}
          </button>
        </form>
      </div>
    </div>
  );
}
