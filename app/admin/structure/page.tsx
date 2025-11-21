'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Grade {
  number: number;
  nameUz: string;
  isActive: boolean;
}

interface Category {
  id: string;
  code: string;
  nameUz: string;
  nameRu?: string;
}

interface Subject {
  id: string;
  code: string;
  nameUz: string;
  descriptionUz?: string;
  icon: string;
  logo?: string;
  banner?: string;
  color: string;
  sortOrder: number;
  grades?: number[];
  categories?: Category[];
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

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export default function AdminStructurePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'grades' | 'subjects' | 'topics'>('topics');

  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<number | ''>('');
  const [filterQuarter, setFilterQuarter] = useState<number | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('grouped');

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal states
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Quick add mode (inline form)
  const [quickAddMode, setQuickAddMode] = useState(false);

  // Form states
  const [gradeForm, setGradeForm] = useState({
    number: 1,
    nameUz: '',
    isActive: true,
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    nameUz: '',
    descriptionUz: '',
    icon: '📚',
    logo: '',
    banner: '',
    color: '#3B82F6',
    sortOrder: 0,
    selectedGrades: [] as number[],
    selectedCategoryIds: [] as string[],
  });

  const [topicForm, setTopicForm] = useState({
    subjectId: '',
    gradeNumber: 5,
    titleUz: '',
    descriptionUz: '',
    quarter: 1,
    weekNumber: 1,
    sortOrder: 0,
  });

  // Toast functions
  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Filtered and grouped topics
  const filteredTopics = useMemo(() => {
    let filtered = topics;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.titleUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.nameUz.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by subject
    if (filterSubject) {
      filtered = filtered.filter(t => t.subjectId === filterSubject);
    }

    // Filter by grade
    if (filterGrade) {
      filtered = filtered.filter(t => t.gradeNumber === filterGrade);
    }

    // Filter by quarter
    if (filterQuarter) {
      filtered = filtered.filter(t => t.quarter === filterQuarter);
    }

    return filtered;
  }, [topics, searchQuery, filterSubject, filterGrade, filterQuarter]);

  // Group topics by subject and grade
  const groupedTopics = useMemo(() => {
    const groups: Record<string, Record<number, Topic[]>> = {};

    filteredTopics.forEach(topic => {
      if (!groups[topic.subjectId]) {
        groups[topic.subjectId] = {};
      }
      if (!groups[topic.subjectId][topic.gradeNumber]) {
        groups[topic.subjectId][topic.gradeNumber] = [];
      }
      groups[topic.subjectId][topic.gradeNumber].push(topic);
    });

    return groups;
  }, [filteredTopics]);

  useEffect(() => {
    checkAdminAccess();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab) {
      loadData();
    }
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

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
        showToast('У вас нет прав доступа к админ-панели', 'error');
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
        // Load both subjects and topics
        const [subjectsRes, topicsRes] = await Promise.all([
          fetch('/api/subjects'),
          fetch('/api/topics')
        ]);
        const subjectsData = await subjectsRes.json();
        const topicsData = await topicsRes.json();
        if (subjectsData.success) setSubjects(subjectsData.data);
        if (topicsData.success) setTopics(topicsData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Malumotlarni yuklashda xato', 'error');
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
        logo: subject.logo || '',
        banner: subject.banner || '',
        color: subject.color,
        sortOrder: subject.sortOrder,
        selectedGrades: subject.grades || [],
        selectedCategoryIds: subject.categories?.map(c => c.id) || [],
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        code: '',
        nameUz: '',
        descriptionUz: '',
        icon: '📚',
        logo: '',
        banner: '',
        color: '#3B82F6',
        sortOrder: 0,
        selectedGrades: [],
        selectedCategoryIds: [],
      });
    }
    setShowSubjectModal(true);
  };

  const saveSubject = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (subjectForm.selectedGrades.length === 0) {
      showToast('Kamida bitta sinf tanlang!', 'error');
      return;
    }

    try {
      const url = '/api/subjects';
      const method = editingSubject ? 'PUT' : 'POST';
      const body = editingSubject
        ? { ...subjectForm, id: editingSubject.id, grades: subjectForm.selectedGrades, categoryIds: subjectForm.selectedCategoryIds }
        : { ...subjectForm, grades: subjectForm.selectedGrades, categoryIds: subjectForm.selectedCategoryIds };

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
        showToast(editingSubject ? 'Fan yangilandi!' : 'Fan qo\'shildi!', 'success');
        setShowSubjectModal(false);
        loadData();
      } else {
        showToast(`Xato: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Save subject error:', error);
      showToast('Fanni saqlashda xato', 'error');
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Ushbu fanni o\'chirmoqchimisiz?')) return;

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
        showToast('Fan o\'chirildi!', 'success');
        loadData();
      } else {
        showToast(`Xato: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Delete subject error:', error);
      showToast('Fanni o\'chirishda xato', 'error');
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
        subjectId: filterSubject || subjects[0]?.id || '',
        gradeNumber: (filterGrade as number) || 5,
        titleUz: '',
        descriptionUz: '',
        quarter: (filterQuarter as number) || 1,
        weekNumber: 1,
        sortOrder: 0,
      });
    }
    setShowTopicModal(true);
    setQuickAddMode(false);
  };

  const saveTopic = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!topicForm.titleUz.trim()) {
      showToast('Mavzu nomini kiriting!', 'error');
      return;
    }

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
        showToast(editingTopic ? 'Mavzu yangilandi!' : 'Mavzu qo\'shildi!', 'success');
        setShowTopicModal(false);
        setQuickAddMode(false);
        loadData();
        // Reset form but keep filters
        setTopicForm({
          subjectId: filterSubject || subjects[0]?.id || '',
          gradeNumber: (filterGrade as number) || 5,
          titleUz: '',
          descriptionUz: '',
          quarter: (filterQuarter as number) || 1,
          weekNumber: 1,
          sortOrder: 0,
        });
      } else {
        showToast(`Xato: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Save topic error:', error);
      showToast('Mavzuni saqlashda xato', 'error');
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm('Ushbu mavzuni o\'chirmoqchimisiz?')) return;

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
        showToast('Mavzu o\'chirildi!', 'success');
        loadData();
      } else {
        showToast(`Xato: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Delete topic error:', error);
      showToast('Mavzuni o\'chirishda xato', 'error');
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
        showToast('Sinf yangilandi!', 'success');
        setShowGradeModal(false);
        loadData();
      } else {
        showToast(`Xato: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Save grade error:', error);
      showToast('Sinfni saqlashda xato', 'error');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      // Ctrl/Cmd + N - New item
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (activeTab === 'topics') {
          setQuickAddMode(true);
        } else if (activeTab === 'subjects') {
          openSubjectModal();
        }
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        setShowTopicModal(false);
        setShowSubjectModal(false);
        setShowGradeModal(false);
        setQuickAddMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-[100] space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in-right ${
                toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                'bg-blue-500 text-white'
              }`}
            >
              <Icon
                icon={
                  toast.type === 'success' ? 'solar:check-circle-bold' :
                  toast.type === 'error' ? 'solar:close-circle-bold' :
                  'solar:info-circle-bold'
                }
                className="text-2xl"
              />
              <span className="font-medium">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              O'quv dasturi tuzilmasi
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Sinflar, fanlar va mavzularni boshqaring</p>
          </div>
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-xl" />
            <span className="hidden sm:inline">Admin panel</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'topics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon
                icon={activeTab === 'topics' ? 'solar:notebook-bold-duotone' : 'solar:notebook-line-duotone'}
                className="text-xl"
              />
              <span>Mavzular</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {topics.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'subjects'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon
                icon={activeTab === 'subjects' ? 'solar:book-2-bold-duotone' : 'solar:book-2-line-duotone'}
                className="text-xl"
              />
              <span>Fanlar</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {subjects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'grades'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon
                icon={activeTab === 'grades' ? 'solar:diploma-bold-duotone' : 'solar:diploma-line-duotone'}
                className="text-xl"
              />
              <span>Sinflar</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {grades.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <Icon icon="svg-spinners:ring-resize" className="text-4xl mx-auto mb-2" />
              <p>Yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* Topics Tab */}
              {activeTab === 'topics' && (
                <div className="p-4 lg:p-6">
                  {/* Search and Filters */}
                  <div className="mb-6 space-y-3">
                    <div className="flex flex-col lg:flex-row gap-3">
                      {/* Search */}
                      <div className="flex-1 relative">
                        <Icon
                          icon="solar:magnifer-line-duotone"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
                        />
                        <input
                          id="search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Mavzu yoki fan nomi... (Ctrl+K)"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <Icon icon="solar:close-circle-bold" className="text-xl" />
                          </button>
                        )}
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                          onClick={() => setViewMode('grouped')}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                            viewMode === 'grouped'
                              ? 'bg-white shadow-sm text-blue-600 font-semibold'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Guruhlangan ko'rinish"
                        >
                          <Icon icon="solar:widget-3-line-duotone" className="text-xl" />
                          <span className="hidden sm:inline">Guruhlab</span>
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                            viewMode === 'table'
                              ? 'bg-white shadow-sm text-blue-600 font-semibold'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          title="Jadval ko'rinishi"
                        >
                          <Icon icon="solar:list-line-duotone" className="text-xl" />
                          <span className="hidden sm:inline">Jadval</span>
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => setQuickAddMode(true)}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors whitespace-nowrap"
                      >
                        <Icon icon="solar:add-circle-bold-duotone" className="text-xl" />
                        <span>Yangi mavzu</span>
                        <span className="hidden lg:inline text-xs opacity-75">(Ctrl+N)</span>
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Barcha fanlar</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.icon} {subject.nameUz}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filterGrade}
                        onChange={(e) => setFilterGrade(e.target.value ? parseInt(e.target.value) : '')}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Barcha sinflar</option>
                        {[1,2,3,4,5,6,7,8,9,10,11].map(grade => (
                          <option key={grade} value={grade}>{grade}-sinf</option>
                        ))}
                      </select>

                      <select
                        value={filterQuarter}
                        onChange={(e) => setFilterQuarter(e.target.value ? parseInt(e.target.value) : '')}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Barcha choraklar</option>
                        {[1,2,3,4].map(quarter => (
                          <option key={quarter} value={quarter}>{quarter}-chorak</option>
                        ))}
                      </select>

                      {(searchQuery || filterSubject || filterGrade || filterQuarter) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterSubject('');
                            setFilterGrade('');
                            setFilterQuarter('');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Icon icon="solar:restart-bold-duotone" className="text-base" />
                          Tozalash
                        </button>
                      )}

                      <div className="ml-auto text-sm text-gray-600 py-1.5">
                        Natija: <span className="font-semibold text-gray-900">{filteredTopics.length}</span>
                      </div>
                    </div>

                  </div>

                  {/* Quick Add Form */}
                  {quickAddMode && (
                    <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon icon="solar:add-circle-bold-duotone" className="text-xl text-blue-600" />
                        <h3 className="font-semibold text-gray-800">Tezkor qo'shish</h3>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-5">
                          <input
                            type="text"
                            value={topicForm.titleUz}
                            onChange={(e) => setTopicForm({...topicForm, titleUz: e.target.value})}
                            placeholder="Mavzu nomi *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTopic();
                              if (e.key === 'Escape') setQuickAddMode(false);
                            }}
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <select
                            value={topicForm.subjectId}
                            onChange={(e) => setTopicForm({...topicForm, subjectId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Fan</option>
                            {subjects.map(subject => (
                              <option key={subject.id} value={subject.id}>{subject.nameUz}</option>
                            ))}
                          </select>
                        </div>
                        <div className="lg:col-span-1">
                          <select
                            value={topicForm.gradeNumber}
                            onChange={(e) => setTopicForm({...topicForm, gradeNumber: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {[1,2,3,4,5,6,7,8,9,10,11].map(grade => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </div>
                        <div className="lg:col-span-1">
                          <select
                            value={topicForm.quarter}
                            onChange={(e) => setTopicForm({...topicForm, quarter: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {[1,2,3,4].map(q => (
                              <option key={q} value={q}>{q}-ch</option>
                            ))}
                          </select>
                        </div>
                        <div className="lg:col-span-3 flex gap-2">
                          <button
                            onClick={saveTopic}
                            disabled={!topicForm.titleUz.trim()}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            <Icon icon="solar:check-circle-bold" className="text-xl" />
                            Saqlash
                          </button>
                          <button
                            onClick={() => setQuickAddMode(false)}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Icon icon="solar:close-circle-bold" className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Topics List */}
                  {filteredTopics.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Icon icon="solar:inbox-line-duotone" className="text-6xl mx-auto mb-3 text-gray-300" />
                      <p className="text-lg">Mavzular topilmadi</p>
                      {(searchQuery || filterSubject || filterGrade || filterQuarter) && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterSubject('');
                            setFilterGrade('');
                            setFilterQuarter('');
                          }}
                          className="mt-3 text-blue-600 hover:text-blue-700"
                        >
                          Filtrlarni tozalash
                        </button>
                      )}
                    </div>
                  ) : viewMode === 'grouped' ? (
                    <div className="space-y-6">
                      {Object.entries(groupedTopics).map(([subjectId, gradeGroups]) => {
                        const subject = subjects.find(s => s.id === subjectId);
                        if (!subject) return null;

                        return (
                          <div key={subjectId} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{subject.icon}</span>
                                <h3 className="font-bold text-gray-800">{subject.nameUz}</h3>
                              </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                              {Object.entries(gradeGroups).map(([gradeNum, topicsInGrade]) => (
                                <div key={gradeNum} className="p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Icon icon="solar:diploma-bold-duotone" className="text-lg text-blue-600" />
                                    <span className="font-semibold text-gray-700">{gradeNum}-sinf</span>
                                    <span className="text-xs text-gray-500">({topicsInGrade.length} ta mavzu)</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {topicsInGrade.map(topic => (
                                      <div
                                        key={topic.id}
                                        className="group relative flex items-center gap-3 p-3 border border-gray-200 hover:border-blue-400 hover:shadow-sm rounded-lg transition-all cursor-pointer"
                                        onClick={() => openTopicModal(topic)}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-800 truncate">
                                            {topic.titleUz}
                                          </p>
                                          {(topic.sortOrder !== undefined || topic.quarter) && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                              {topic.sortOrder !== undefined && (
                                                <span className="font-semibold text-gray-700">{topic.sortOrder}-mavzu</span>
                                              )}
                                              {topic.sortOrder !== undefined && topic.quarter && ' • '}
                                              {topic.quarter && `${topic.quarter}-chorak`}
                                              {topic.weekNumber && ` • ${topic.weekNumber}-hafta`}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openTopicModal(topic);
                                            }}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Ko'rish va tahrirlash"
                                          >
                                            <Icon icon="solar:eye-bold-duotone" className="text-lg" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200 bg-gray-50">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Mavzu</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Fan</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Sinf</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Chorak</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Amallar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTopics.map((topic) => (
                            <tr
                              key={topic.id}
                              className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => openTopicModal(topic)}
                            >
                              <td className="py-3 px-4 font-medium text-gray-800">{topic.titleUz}</td>
                              <td className="py-3 px-4 text-gray-600 text-sm">{topic.subject.nameUz}</td>
                              <td className="py-3 px-4 text-gray-600 text-sm">{topic.gradeNumber}-sinf</td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {topic.sortOrder !== undefined && (
                                  <span className="font-semibold text-gray-700">{topic.sortOrder}-mavzu</span>
                                )}
                                {topic.sortOrder !== undefined && topic.quarter && ' • '}
                                {topic.quarter && `${topic.quarter}-chorak`}
                                {topic.weekNumber && ` • ${topic.weekNumber}-hafta`}
                                {!topic.sortOrder && !topic.quarter && '-'}
                              </td>
                              <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openTopicModal(topic)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="Ko'rish va tahrirlash"
                                >
                                  <Icon icon="solar:eye-bold-duotone" className="text-base" />
                                  <span className="text-sm hidden sm:inline">Ko'rish</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Subjects Tab */}
              {activeTab === 'subjects' && (
                <div className="p-4 lg:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Fanlar ro'yxati ({subjects.length})
                    </h2>
                    <button
                      onClick={() => openSubjectModal()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <Icon icon="solar:add-circle-bold-duotone" className="text-xl" />
                      Yangi fan
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
                              {subject.grades && subject.grades.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {subject.grades.length} sinf
                                </p>
                              )}
                              {subject.categories && subject.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {subject.categories.map(cat => (
                                    <span
                                      key={cat.id}
                                      className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                                    >
                                      {cat.nameUz}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openSubjectModal(subject)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Icon icon="solar:pen-bold-duotone" className="text-lg" />
                            </button>
                            <button
                              onClick={() => deleteSubject(subject.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-lg" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === 'grades' && (
                <div className="p-4 lg:p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingSubject ? 'Fanni tahrirlash' : 'Yangi fan qo\'shish'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo (SVG/PNG)
                </label>
                <div className="space-y-2">
                  {!subjectForm.logo ? (
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border-2 border-dashed border-blue-300 rounded-lg transition-colors">
                          <Icon icon="solar:upload-bold" className="text-xl" />
                          <span className="font-medium">Logo yuklash</span>
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Проверка размера (5MB макс)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Fayl hajmi juda katta. Maksimal 5MB');
                              return;
                            }

                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'logo');

                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                },
                                body: formData,
                              });

                              const result = await res.json();
                              if (result.success) {
                                setSubjectForm({...subjectForm, logo: result.data.url});
                              } else {
                                alert(result.message || 'Yuklashda xatolik');
                              }
                            } catch (err) {
                              console.error('Upload error:', err);
                              alert('Yuklashda xatolik');
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img
                          src={subjectForm.logo}
                          alt="Logo preview"
                          className="h-20 w-20 object-contain rounded-lg bg-white p-2 border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23fee" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23c00" font-size="12"%3EXato%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Logo yuklandi</p>
                          <p className="text-xs text-gray-500 mt-1">{subjectForm.logo}</p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            // Удаляем файл с сервера если это наш файл
                            if (subjectForm.logo.startsWith('/uploads/subjects/')) {
                              try {
                                const token = localStorage.getItem('token');
                                await fetch(`/api/upload?url=${encodeURIComponent(subjectForm.logo)}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });
                              } catch (err) {
                                console.error('Delete error:', err);
                              }
                            }
                            setSubjectForm({...subjectForm, logo: ''});
                          }}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Icon icon="solar:trash-bin-minimalistic-bold" className="text-base" />
                          O'chirish
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    <Icon icon="solar:info-circle-bold" className="inline text-blue-500 mr-1" />
                    SVG yoki PNG fayl yuklang (tavsiya: 200x200px, maks 5MB)
                  </p>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner (gorizontal rasm, max 1280px kenglik)
                </label>
                <div className="space-y-2">
                  {!subjectForm.banner ? (
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-600 border-2 border-dashed border-green-300 rounded-lg transition-colors">
                          <Icon icon="solar:upload-bold" className="text-xl" />
                          <span className="font-medium">Banner yuklash</span>
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // Проверка размера (5MB макс)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Fayl hajmi juda katta. Maksimal 5MB');
                              return;
                            }

                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('type', 'banner');

                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch('/api/upload', {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                },
                                body: formData,
                              });

                              const result = await res.json();
                              if (result.success) {
                                setSubjectForm({...subjectForm, banner: result.data.url});
                              } else {
                                alert(result.message || 'Yuklashda xatolik');
                              }
                            } catch (err) {
                              console.error('Upload error:', err);
                              alert('Yuklashda xatolik');
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <img
                        src={subjectForm.banner}
                        alt="Banner preview"
                        className="w-full h-auto max-h-48 object-cover rounded-lg mb-3 border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1280" height="400"%3E%3Crect fill="%23fee" width="1280" height="400"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23c00" font-size="24"%3EXato%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Banner yuklandi</p>
                          <p className="text-xs text-gray-500 mt-1">{subjectForm.banner}</p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            // Удаляем файл с сервера если это наш файл
                            if (subjectForm.banner.startsWith('/uploads/subjects/')) {
                              try {
                                const token = localStorage.getItem('token');
                                await fetch(`/api/upload?url=${encodeURIComponent(subjectForm.banner)}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });
                              } catch (err) {
                                console.error('Delete error:', err);
                              }
                            }
                            setSubjectForm({...subjectForm, banner: ''});
                          }}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Icon icon="solar:trash-bin-minimalistic-bold" className="text-base" />
                          O'chirish
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    <Icon icon="solar:info-circle-bold" className="inline text-blue-500 mr-1" />
                    JPG yoki PNG fayl yuklang (tavsiya: 1280x400px, maks 5MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Kategoriyalar (fan qaysi kategoriyaga kiradi)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        subjectForm.selectedCategoryIds.includes(category.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-white hover:border-green-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={subjectForm.selectedCategoryIds.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSubjectForm({
                              ...subjectForm,
                              selectedCategoryIds: [...subjectForm.selectedCategoryIds, category.id]
                            });
                          } else {
                            setSubjectForm({
                              ...subjectForm,
                              selectedCategoryIds: subjectForm.selectedCategoryIds.filter(id => id !== category.id)
                            });
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{category.nameUz}</div>
                        {category.nameRu && (
                          <div className="text-xs text-gray-500">{category.nameRu}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sinflar (bu fan qaysi sinflarda oʻqitiladi) *
                </label>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
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
                      <span className="text-sm">{gradeNum === 0 ? 'Tayy.' : gradeNum}</span>
                    </label>
                  ))}
                </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingTopic ? 'Mavzuni tahrirlash' : 'Yangi mavzu qo\'shish'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Saqlash
              </button>
              <button
                onClick={() => setShowTopicModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Bekor qilish
              </button>
              {editingTopic && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm('Ushbu mavzuni o\'chirmoqchimisiz?')) {
                      deleteTopic(editingTopic.id);
                      setShowTopicModal(false);
                    }
                  }}
                  className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors"
                >
                  O'chirish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 lg:p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6">
              {gradeForm.number}-sinfni tahrirlash
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomi *
                </label>
                <input
                  type="text"
                  value={gradeForm.nameUz}
                  onChange={(e) => setGradeForm({...gradeForm, nameUz: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="1-sinf"
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
