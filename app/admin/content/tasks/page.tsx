'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  SingleChoiceFormComponent,
  MultipleChoiceFormComponent,
  TrueFalseFormComponent,
  ShortAnswerFormComponent,
  FillBlanksFormComponent,
  MatchingFormComponent,
  EssayFormComponent
} from '../ContentForms';
import MathRenderer from '@/components/MathRenderer';

type TaskSubType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_BLANKS' | 'MATCHING' | 'ESSAY';

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  subject: {
    nameUz: string;
    code: string;
  };
}

interface Task {
  id: string;
  titleUz: string;
  content: any;
  difficulty: string;
  status: string;
  createdAt: string;
  topic: {
    id: string;
    titleUz: string;
    gradeNumber: number;
  };
  subject: {
    id: string;
    code: string;
    nameUz: string;
  };
  metadata?: {
    isAiGenerated?: boolean;
    generatedAt?: string;
    approved?: boolean;
  };
}

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskSubType, setTaskSubType] = useState<TaskSubType | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'AI' | 'DB'>(
    (searchParams?.get('filter')?.toUpperCase() as 'AI' | 'DB') || 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>(
    (searchParams?.get('status')?.toUpperCase() as 'APPROVED' | 'PENDING') || 'ALL'
  );
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');

  // Data for filters
  const [subjects, setSubjects] = useState<Array<{id: string, code: string, nameUz: string}>>([]);
  const [grades, setGrades] = useState<number[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadSubjectsAndGrades();
    loadTasks();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [sourceFilter, statusFilter, selectedGrade, selectedSubject, selectedTopic, taskTypeFilter, difficultyFilter]);

  const loadSubjectsAndGrades = async () => {
    try {
      const token = localStorage.getItem('token');

      // Load subjects
      const subjectsResponse = await fetch('/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsResponse.json();
      if (subjectsData.success) {
        setSubjects(subjectsData.data);
      }

      // Load topics
      const topicsResponse = await fetch('/api/topics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const topicsData = await topicsResponse.json();
      if (topicsData.success) {
        setTopics(topicsData.data);
      }

      // Load tasks to extract grades that have actual tasks
      const tasksResponse = await fetch('/api/content/items?type=TASK', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasksData = await tasksResponse.json();
      if (tasksData.success && tasksData.data.length > 0) {
        // Extract unique grades from tasks (not topics)
        const uniqueGrades = [...new Set(tasksData.data.map((task: Task) => task.topic.gradeNumber))].sort((a, b) => a - b);
        setGrades(uniqueGrades as number[]);
      }
    } catch (error) {
      console.error('Failed to load subjects and grades:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      // Always filter by TASK type
      params.append('type', 'TASK');

      if (selectedGrade) params.append('grade', selectedGrade.toString());
      if (selectedSubject) params.append('subject', selectedSubject);
      // Note: difficulty filter removed as it's not in the API

      const response = await fetch(`/api/content/items?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    const token = localStorage.getItem('token');
    try {
      // Find the task to get its current data
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Update metadata to mark as approved
      const updatedContent = {
        ...task.content,
        metadata: {
          ...task.content.metadata,
          approved: true,
          approvedAt: new Date().toISOString(),
        },
      };

      const response = await fetch(`/api/content/items`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          titleUz: task.titleUz,
          content: updatedContent,
          difficulty: task.difficulty,
          status: task.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Topshiriq tasdiqlandi');
        loadTasks();
      }
    } catch (error) {
      console.error('Failed to approve task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Bu topshiriqni oʻchirishga ishonchingiz komilmi?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/content/items?id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Topshiriq oʻchirildi');
        loadTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const loadTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/topics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const openAddModal = () => {
    loadTopics();
    setShowAddModal(true);
    setTaskSubType(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setTaskSubType(null);
  };

  const saveContent = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/content/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert('Topshiriq muvaffaqiyatli qoʻshildi');
        closeAddModal();
        loadTasks();
      } else {
        alert('Xatolik: ' + (data.message || 'Topshiriq qoʻshishda xatolik'));
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Topshiriq qoʻshishda xatolik yuz berdi');
    }
  };

  const updateTask = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/content/items`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: viewTask?.id,
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Topshiriq muvaffaqiyatli yangilandi');
        setViewTask(null);
        setIsEditMode(false);
        loadTasks();
      } else {
        alert('Xatolik: ' + (data.message || 'Topshiriqni yangilashda xatolik'));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Topshiriqni yangilashda xatolik yuz berdi');
    }
  };

  const getTypeName = (type: TaskSubType | null): string => {
    if (!type) return '';
    const names: Record<TaskSubType, string> = {
      'SINGLE_CHOICE': 'Bir javobli test',
      'MULTIPLE_CHOICE': 'Koʻp javobli test',
      'TRUE_FALSE': 'Toʻgʻri/Notoʻgʻri',
      'SHORT_ANSWER': 'Qisqa javob',
      'FILL_BLANKS': 'Boʻshliqni toʻldirish',
      'MATCHING': 'Moslashtirish',
      'ESSAY': 'Esse',
    };
    return names[type] || type;
  };

  const getTypeIcon = (type: TaskSubType | null): string => {
    if (!type) return '';
    const icons: Record<TaskSubType, string> = {
      'SINGLE_CHOICE': 'solar:check-circle-bold-duotone',
      'MULTIPLE_CHOICE': 'solar:check-square-bold-duotone',
      'TRUE_FALSE': 'solar:close-circle-bold-duotone',
      'SHORT_ANSWER': 'solar:pen-bold-duotone',
      'FILL_BLANKS': 'solar:text-bold-duotone',
      'MATCHING': 'solar:link-bold-duotone',
      'ESSAY': 'solar:document-text-bold-duotone',
    };
    return icons[type] || 'solar:document-bold-duotone';
  };

  const filteredTasks = tasks.filter(task => {
    if (sourceFilter === 'AI' && !task.metadata?.isAiGenerated) return false;
    if (sourceFilter === 'DB' && task.metadata?.isAiGenerated) return false;
    if (statusFilter === 'APPROVED' && !task.metadata?.approved) return false;
    if (statusFilter === 'PENDING' && task.metadata?.approved) return false;
    if (selectedTopic && task.topic.id !== selectedTopic) return false;
    if (taskTypeFilter !== 'ALL' && task.content?.task_type !== taskTypeFilter) return false;
    if (difficultyFilter !== 'ALL' && task.difficulty !== difficultyFilter) return false;
    return true;
  });

  // Get available topics based on selected grade and subject
  const availableTopics = topics.filter(topic => {
    if (selectedGrade && topic.gradeNumber !== selectedGrade) return false;
    if (selectedSubject && topic.subject.code !== selectedSubject) return false;
    return true;
  });

  const stats = {
    total: tasks.length,
    ai: tasks.filter(t => t.metadata?.isAiGenerated).length,
    db: tasks.filter(t => !t.metadata?.isAiGenerated).length,
    approved: tasks.filter(t => t.metadata?.approved).length,
    pending: tasks.filter(t => !t.metadata?.approved && t.metadata?.isAiGenerated).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/content"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon icon="solar:arrow-left-bold-duotone" className="text-2xl" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Icon icon="solar:document-text-bold-duotone" className="text-blue-600" />
                  Topshiriqlar
                </h1>
                <p className="text-gray-600 mt-1">Barcha test savollari va topshiriqlar</p>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Icon icon="solar:add-circle-bold-duotone" className="text-xl" />
              <span>Yangi qoʻshish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`p-4 rounded-xl transition-all ${
              sourceFilter === 'ALL'
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className={`text-sm ${sourceFilter === 'ALL' ? 'text-blue-100' : 'text-gray-600'}`}>
              Jami topshiriqlar
            </div>
          </button>

          <button
            onClick={() => setSourceFilter('AI')}
            className={`p-4 rounded-xl transition-all ${
              sourceFilter === 'AI'
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icon icon="solar:magic-stick-3-bold-duotone" className="text-xl" />
              <div className="text-2xl font-bold">{stats.ai}</div>
            </div>
            <div className={`text-sm ${sourceFilter === 'AI' ? 'text-purple-100' : 'text-gray-600'}`}>
              AI yaratgan
            </div>
          </button>

          <button
            onClick={() => setSourceFilter('DB')}
            className={`p-4 rounded-xl transition-all ${
              sourceFilter === 'DB'
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icon icon="solar:book-bold-duotone" className="text-xl" />
              <div className="text-2xl font-bold">{stats.db}</div>
            </div>
            <div className={`text-sm ${sourceFilter === 'DB' ? 'text-green-100' : 'text-gray-600'}`}>
              Darslikdan
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`p-4 rounded-xl transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icon icon="solar:check-circle-bold-duotone" className="text-xl" />
              <div className="text-2xl font-bold">{stats.approved}</div>
            </div>
            <div className={`text-sm ${statusFilter === 'APPROVED' ? 'text-emerald-100' : 'text-gray-600'}`}>
              Tasdiqlangan
            </div>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-xl transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icon icon="solar:clock-circle-bold-duotone" className="text-xl" />
              <div className="text-2xl font-bold">{stats.pending}</div>
            </div>
            <div className={`text-sm ${statusFilter === 'PENDING' ? 'text-yellow-100' : 'text-gray-600'}`}>
              Kutilmoqda
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon icon="solar:filter-bold-duotone" className="text-xl text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtrlar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf
              </label>
              <select
                value={selectedGrade || ''}
                onChange={(e) => {
                  setSelectedGrade(e.target.value ? Number(e.target.value) : null);
                  setSelectedTopic(''); // Reset topic when grade changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Barcha sinflar</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}-sinf</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fan
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic(''); // Reset topic when subject changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Barcha fanlar</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.code}>{subject.nameUz}</option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mavzu
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={availableTopics.length === 0}
              >
                <option value="">Barcha mavzular</option>
                {availableTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.titleUz}</option>
                ))}
              </select>
            </div>

            {/* Task Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topshiriq turi
              </label>
              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Barcha turlar</option>
                <option value="SINGLE_CHOICE">Bir javobli test</option>
                <option value="MULTIPLE_CHOICE">Koʻp javobli test</option>
                <option value="TRUE_FALSE">Toʻgʻri/Notoʻgʻri</option>
                <option value="SHORT_ANSWER">Qisqa javob</option>
                <option value="FILL_BLANKS">Boʻshliqni toʻldirish</option>
                <option value="MATCHING">Moslashtirish</option>
                <option value="ESSAY">Esse</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qiyinlik darajasi
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as 'ALL' | 'EASY' | 'MEDIUM' | 'HARD')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Barcha darajalar</option>
                <option value="EASY">Oson</option>
                <option value="MEDIUM">Oʻrtacha</option>
                <option value="HARD">Qiyin</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Button */}
          {(selectedGrade || selectedSubject || selectedTopic || taskTypeFilter !== 'ALL' || difficultyFilter !== 'ALL') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedGrade(null);
                  setSelectedSubject('');
                  setSelectedTopic('');
                  setTaskTypeFilter('ALL');
                  setDifficultyFilter('ALL');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon icon="solar:restart-bold-duotone" className="text-lg" />
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Topshiriqlar roʻyxati ({filteredTasks.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Icon icon="solar:refresh-circle-bold-duotone" className="text-6xl text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Yuklanmoqda...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Icon icon="solar:inbox-line-bold-duotone" className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Topshiriqlar topilmadi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Topshiriq
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sinf / Fan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mavzu
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task) => {
                    const questionText = task.content?.questionText || task.titleUz || '';
                    const displayText = questionText.length > 40 ? questionText.substring(0, 40) + '...' : questionText;
                    const taskType = task.content?.task_type as TaskSubType;

                    return (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Icon
                                icon={getTypeIcon(taskType)}
                                className="text-lg text-blue-600"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => {
                                  setViewTask(task);
                                  setIsEditMode(false);
                                }}
                              >
                                {displayText}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                {taskType && (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                    {getTypeName(taskType)}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  task.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                  task.difficulty === 'HARD' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {task.difficulty === 'EASY' ? 'Oson' :
                                   task.difficulty === 'HARD' ? 'Qiyin' : 'Oʻrta'}
                                </span>
                                {task.metadata?.isAiGenerated ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                    <Icon icon="solar:magic-stick-3-bold-duotone" className="text-xs" />
                                    AI
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                    <Icon icon="solar:book-bold-duotone" className="text-xs" />
                                    Darslik
                                  </span>
                                )}
                                {task.metadata?.approved ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                                    <Icon icon="solar:check-circle-bold" className="text-xs" />
                                    Tasdiqlangan
                                  </span>
                                ) : task.metadata?.isAiGenerated ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                    <Icon icon="solar:clock-circle-bold" className="text-xs" />
                                    Kutilmoqda
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{task.topic.gradeNumber}-sinf</div>
                          <div className="text-xs text-gray-500">{task.subject.nameUz}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{task.topic.titleUz}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {task.metadata?.isAiGenerated && !task.metadata?.approved && (
                              <button
                                onClick={() => handleApprove(task.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Tasdiqlash"
                              >
                                <Icon icon="solar:check-circle-bold-duotone" className="text-xl" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="O'chirish"
                            >
                              <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-xl" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View/Edit Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icon icon={getTypeIcon(viewTask.content?.task_type as TaskSubType)} className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isEditMode ? 'Topshiriqni tahrirlash' : 'Topshiriq koʻrish'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{getTypeName(viewTask.content?.task_type as TaskSubType)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="text-2xl" />
              </button>
            </div>

            {/* Task Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-600 mb-1">Sinf</div>
                <div className="font-semibold text-gray-900">{viewTask.topic.gradeNumber}-sinf</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Fan</div>
                <div className="font-semibold text-gray-900">{viewTask.subject.nameUz}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Mavzu</div>
                <div className="font-semibold text-gray-900">{viewTask.topic.titleUz}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Qiyinlik</div>
                <div className={`font-semibold ${
                  viewTask.difficulty === 'EASY' ? 'text-green-600' :
                  viewTask.difficulty === 'HARD' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {viewTask.difficulty === 'EASY' ? 'Oson' :
                   viewTask.difficulty === 'HARD' ? 'Qiyin' : 'Oʻrta'}
                </div>
              </div>
            </div>

            {/* Render appropriate form based on task type */}
            {viewTask.content?.task_type === 'SINGLE_CHOICE' && (
              <SingleChoiceFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {viewTask.content?.task_type === 'MULTIPLE_CHOICE' && (
              <MultipleChoiceFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {viewTask.content?.task_type === 'TRUE_FALSE' && (
              <TrueFalseFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {viewTask.content?.task_type === 'SHORT_ANSWER' && (
              <ShortAnswerFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {viewTask.content?.task_type === 'FILL_BLANKS' && (
              <FillBlanksFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {viewTask.content?.task_type === 'MATCHING' && (
              <MatchingFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {viewTask.content?.task_type === 'ESSAY' && (
              <EssayFormComponent
                topicId={viewTask.topic.id}
                topics={topics}
                onSave={updateTask}
                onCancel={() => {
                  setViewTask(null);
                  setIsEditMode(false);
                }}
                initialData={viewTask}
                readOnly={!isEditMode}
              />
            )}

            {/* Edit Mode Toggle Button */}
            {!isEditMode && (
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  {viewTask.metadata?.isAiGenerated && !viewTask.metadata?.approved && (
                    <button
                      onClick={() => {
                        handleApprove(viewTask.id);
                        setViewTask(null);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Icon icon="solar:check-circle-bold-duotone" className="text-lg" />
                      Tasdiqlash
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Icon icon="solar:pen-bold-duotone" className="text-lg" />
                    Tahrirlash
                  </button>
                </div>
                <button
                  onClick={() => {
                    setViewTask(null);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Yopish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Topshiriq qoʻshish
            </h2>

            {/* Step 1: Choose Task Type */}
            {!taskSubType && (
              <div>
                <p className="text-gray-600 mb-4">Topshiriq turini tanlang:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANKS', 'MATCHING', 'ESSAY'] as TaskSubType[]).map(subType => (
                    <button
                      key={subType}
                      onClick={() => setTaskSubType(subType)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Icon icon={getTypeIcon(subType)} className="text-3xl text-blue-600" />
                      </div>
                      <div className="font-medium text-sm">{getTypeName(subType)}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeAddModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Render Form based on task type */}
            {taskSubType && (
              <div>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <p className="text-blue-800 flex items-center gap-2">
                    <Icon icon={getTypeIcon(taskSubType)} className="text-xl" />
                    <strong>{getTypeName(taskSubType)}</strong> qoʻshish
                  </p>
                  <button
                    onClick={() => setTaskSubType(null)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Icon icon="solar:arrow-left-bold" />
                    Orqaga
                  </button>
                </div>

                {taskSubType === 'SINGLE_CHOICE' && (
                  <SingleChoiceFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}

                {taskSubType === 'MULTIPLE_CHOICE' && (
                  <MultipleChoiceFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}

                {taskSubType === 'TRUE_FALSE' && (
                  <TrueFalseFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}

                {taskSubType === 'SHORT_ANSWER' && (
                  <ShortAnswerFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}

                {taskSubType === 'FILL_BLANKS' && (
                  <FillBlanksFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}

                {taskSubType === 'MATCHING' && (
                  <MatchingFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}

                {taskSubType === 'ESSAY' && (
                  <EssayFormComponent
                    topicId=""
                    topics={topics}
                    onSave={saveContent}
                    onCancel={closeAddModal}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
