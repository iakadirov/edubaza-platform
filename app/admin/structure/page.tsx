'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  sortOrder: number;
  grades?: number[]; // Список классов, где преподается предмет
}

interface Topic {
  id: string;
  subjectId: string;
  titleUz: string;
  descriptionUz?: string;
  gradeNumber: number;
  quarter: number | null;
  weekNumber?: number | null;
  sortOrder?: number;
  subject: {
    nameUz: string;
    code: string;
  };
}

export default function AdminStructurePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'grades' | 'subjects' | 'topics'>('subjects');

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [loading, setLoading] = useState(false);

  // Modal states
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Form states for grade
  const [gradeForm, setGradeForm] = useState({
    number: 1,
    nameUz: '',
    isActive: true,
  });

  // Form states for subject
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    nameUz: '',
    descriptionUz: '',
    icon: '📚',
    color: '#3B82F6',
    sortOrder: 0,
    selectedGrades: [] as number[], // Выбранные классы
  });

  // Form states for topic
  const [topicForm, setTopicForm] = useState({
    subjectId: '',
    gradeNumber: 5,
    titleUz: '',
    descriptionUz: '',
    quarter: 1,
    weekNumber: 1,
    sortOrder: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (activeTab) {
      loadData();
    }
  }, [activeTab]);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/user/check-admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success || !data.isAdmin) {
        alert('У вас нет прав доступа к админ-панели');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/dashboard');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'grades') {
        const res = await fetch('/api/grades');
        const data = await res.json();
        if (data.success) setGrades(data.data);
      } else if (activeTab === 'subjects') {
        const res = await fetch('/api/subjects');
        const data = await res.json();
        if (data.success) setSubjects(data.data);
      } else if (activeTab === 'topics') {
        const res = await fetch('/api/topics');
        const data = await res.json();
        if (data.success) setTopics(data.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subject CRUD operations
  const openSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({
        code: subject.code,
        nameUz: subject.nameUz,
        descriptionUz: subject.descriptionUz || '',
        icon: subject.icon,
        color: subject.color,
        sortOrder: subject.sortOrder,
        selectedGrades: subject.grades || [],
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        code: '',
        nameUz: '',
        descriptionUz: '',
        icon: '📚',
        color: '#3B82F6',
        sortOrder: 0,
        selectedGrades: [],
      });
    }
    setShowSubjectModal(true);
  };

  const saveSubject = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Валидация
    if (subjectForm.selectedGrades.length === 0) {
      alert('Kamida bitta sinf tanlang!');
      return;
    }

    try {
      const url = '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';
      const body = editingSubject
        ? { ...subjectForm, id: editingSubject.id, grades: subjectForm.selectedGrades }
        : { ...subjectForm, grades: subjectForm.selectedGrades };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingSubject ? 'Предмет обновлён!' : 'Предмет создан!');
        setShowSubjectModal(false);
        loadData();
      } else {
        alert(`Ошибка: ${data.message}`);
      }
    } catch (error) {
      console.error('Save subject error:', error);
      alert('Ошибка при сохранении предмета');
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот предмет?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/subjects?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Предмет удалён!');
        loadData();
      } else {
        alert(`Ошибка: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete subject error:', error);
      alert('Ошибка при удалении предмета');
    }
  };

  // Topic CRUD operations
  const openTopicModal = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({
        subjectId: topic.subjectId,
        gradeNumber: topic.gradeNumber,
        titleUz: topic.titleUz,
        descriptionUz: topic.descriptionUz || '',
        quarter: topic.quarter || 1,
        weekNumber: topic.weekNumber || 1,
        sortOrder: topic.sortOrder || 0,
      });
    } else {
      setEditingTopic(null);
      setTopicForm({
        subjectId: subjects[0]?.id || '',
        gradeNumber: 5,
        titleUz: '',
        descriptionUz: '',
        quarter: 1,
        weekNumber: 1,
        sortOrder: 0,
      });
    }
    setShowTopicModal(true);
  };

  const saveTopic = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = '/api/topics';
      const method = editingTopic ? 'PUT' : 'POST';
      const body = editingTopic
        ? { ...topicForm, id: editingTopic.id }
        : topicForm;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingTopic ? 'Mavzu yangilandi!' : 'Mavzu qo\'shildi!');
        setShowTopicModal(false);
        loadData();
      } else {
        alert(`Xato: ${data.message}`);
      }
    } catch (error) {
      console.error('Save topic error:', error);
      alert('Mavzuni saqlashda xato');
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm('Ushbu mavzuni oʻchirmoqchimisiz?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/topics?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Mavzu oʻchirildi!');
        loadData();
      } else {
        alert(`Xato: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete topic error:', error);
      alert('Mavzuni oʻchirishda xato');
    }
  };

  // Grade operations
  const openGradeModal = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeForm({
      number: grade.number,
      nameUz: grade.nameUz,
      isActive: grade.isActive,
    });
    setShowGradeModal(true);
  };

  const saveGrade = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/grades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(gradeForm),
      });

      const data = await response.json();

      if (data.success) {
        alert('Sinf yangilandi!');
        setShowGradeModal(false);
        loadData();
      } else {
        alert(`Xato: ${data.message}`);
      }
    } catch (error) {
      console.error('Save grade error:', error);
      alert('Sinfni saqlashda xato');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Oʻquv dasturi tuzilmasi
            </h1>
            <p className="text-gray-600 mt-1">Sinflar, fanlar va mavzularni boshqaring</p>
          </div>
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Admin paneliga qaytish
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'subjects'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📚 Fanlar
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'topics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📖 Mavzular
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'grades'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎓 Sinflar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Yuklanmoqda...</div>
          ) : (
            <>
              {/* Subjects Tab */}
              {activeTab === 'subjects' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Fanlar ro'yxati ({subjects.length})
                    </h2>
                    <button
                      onClick={() => openSubjectModal()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      + Yangi fan qo'shish
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <div
                        key={subject.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{subject.icon}</span>
                            <div>
                              <h3 className="font-bold text-gray-800">{subject.nameUz}</h3>
                              <p className="text-xs text-gray-400 mt-1">Kod: {subject.code}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openSubjectModal(subject)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteSubject(subject.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics Tab */}
              {activeTab === 'topics' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Mavzular ro'yxati ({topics.length})
                    </h2>
                    <button
                      onClick={() => openTopicModal()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      + Yangi mavzu qo'shish
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Mavzu nomi</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Fan</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Sinf</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Chorak</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topics.map((topic) => (
                          <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-gray-800">{topic.titleUz}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{topic.subject.nameUz}</td>
                            <td className="py-3 px-4 text-gray-600">{topic.gradeNumber}-sinf</td>
                            <td className="py-3 px-4 text-gray-600">
                              {topic.quarter ? `${topic.quarter}-chorak` : '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => openTopicModal(topic)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                              >
                                ✏️ Tahrirlash
                              </button>
                              <button
                                onClick={() => deleteTopic(topic.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                🗑️ O'chirish
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === 'grades' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Sinflar ro'yxati ({grades.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {grades.map((grade) => (
                      <div
                        key={grade.number}
                        className={`border-2 rounded-lg p-6 text-center cursor-pointer hover:shadow-lg transition-shadow ${
                          grade.isActive
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-gray-50 opacity-50'
                        }`}
                        onClick={() => openGradeModal(grade)}
                      >
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                          {grade.number}
                        </div>
                        <div className="text-sm text-gray-600">{grade.nameUz}</div>
                        <div className="mt-3">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              grade.isActive
                                ? 'bg-green-200 text-green-800'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {grade.isActive ? 'Faol' : 'Nofaol'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          ✏️ Tahrirlash
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingSubject ? 'Fanni tahrirlash' : 'Yangi fan qo\'shish'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kod *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="MATHEMATICS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tartib raqami
                  </label>
                  <input
                    type="number"
                    value={subjectForm.sortOrder}
                    onChange={(e) => setSubjectForm({...subjectForm, sortOrder: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomi *
                </label>
                <input
                  type="text"
                  value={subjectForm.nameUz}
                  onChange={(e) => setSubjectForm({...subjectForm, nameUz: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Matematika"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji ikonka
                  </label>
                  <input
                    type="text"
                    value={subjectForm.icon}
                    onChange={(e) => setSubjectForm({...subjectForm, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-2xl"
                    placeholder="📚"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rang
                  </label>
                  <input
                    type="color"
                    value={subjectForm.color}
                    onChange={(e) => setSubjectForm({...subjectForm, color: e.target.value})}
                    className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={subjectForm.descriptionUz}
                  onChange={(e) => setSubjectForm({...subjectForm, descriptionUz: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              {/* Выбор классов */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sinflar (bu fan qaysi sinflarda oʻqitiladi) *
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {[0,1,2,3,4,5,6,7,8,9,10,11].map(gradeNum => (
                    <label
                      key={gradeNum}
                      className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        subjectForm.selectedGrades.includes(gradeNum)
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={subjectForm.selectedGrades.includes(gradeNum)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSubjectForm({
                              ...subjectForm,
                              selectedGrades: [...subjectForm.selectedGrades, gradeNum].sort((a, b) => a - b)
                            });
                          } else {
                            setSubjectForm({
                              ...subjectForm,
                              selectedGrades: subjectForm.selectedGrades.filter(g => g !== gradeNum)
                            });
                          }
                        }}
                        className="sr-only"
                      />
                      <span>{gradeNum === 0 ? 'Tayyorlov' : `${gradeNum}-sinf`}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Kamida bitta sinf tanlang
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveSubject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingTopic ? 'Mavzuni tahrirlash' : 'Yangi mavzu qo\'shish'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fan *
                  </label>
                  <select
                    value={topicForm.subjectId}
                    onChange={(e) => setTopicForm({...topicForm, subjectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Tanlang</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.nameUz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sinf *
                  </label>
                  <select
                    value={topicForm.gradeNumber}
                    onChange={(e) => setTopicForm({...topicForm, gradeNumber: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11].map(grade => (
                      <option key={grade} value={grade}>{grade}-sinf</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mavzu nomi *
                </label>
                <input
                  type="text"
                  value={topicForm.titleUz}
                  onChange={(e) => setTopicForm({...topicForm, titleUz: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Oddiy kasrlar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={topicForm.descriptionUz}
                  onChange={(e) => setTopicForm({...topicForm, descriptionUz: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chorak
                  </label>
                  <select
                    value={topicForm.quarter}
                    onChange={(e) => setTopicForm({...topicForm, quarter: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={1}>1-chorak</option>
                    <option value={2}>2-chorak</option>
                    <option value={3}>3-chorak</option>
                    <option value={4}>4-chorak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hafta
                  </label>
                  <input
                    type="number"
                    value={topicForm.weekNumber}
                    onChange={(e) => setTopicForm({...topicForm, weekNumber: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max="36"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tartib
                  </label>
                  <input
                    type="number"
                    value={topicForm.sortOrder}
                    onChange={(e) => setTopicForm({...topicForm, sortOrder: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveTopic}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowTopicModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">
              {gradeForm.number}-sinfni tahrirlash
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomi (Oʻzbekcha) *
                </label>
                <input
                  type="text"
                  value={gradeForm.nameUz}
                  onChange={(e) => setGradeForm({...gradeForm, nameUz: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="1-sinf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomi (Ruscha) *
                </label>
                <input
                  type="text"
                  value={gradeForm.nameRu}
                  onChange={(e) => setGradeForm({...gradeForm, nameRu: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="1-й класс"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gradeActive"
                  checked={gradeForm.isActive}
                  onChange={(e) => setGradeForm({...gradeForm, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="gradeActive" className="ml-2 text-sm text-gray-700">
                  Faol (bu sinfdan kontentlar yaratish mumkin)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveGrade}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowGradeModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
