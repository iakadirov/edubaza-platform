'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  PresentationFormComponent,
  LessonPlanFormComponent,
  SingleChoiceFormComponent,
  MultipleChoiceFormComponent,
  TrueFalseFormComponent,
  ShortAnswerFormComponent,
  FillBlanksFormComponent,
  MatchingFormComponent,
  EssayFormComponent
} from './ContentForms';
import TopicAutocomplete from './TopicAutocomplete';

// Типы контента (БЕЗ TOPIC - темы управляются в /admin/structure)
type ContentType = 'ALL' | 'PRESENTATION' | 'LESSON_PLAN' | 'TASK';

// Подтипы задач (внутри TASK)
type TaskSubType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_BLANKS' | 'MATCHING' | 'ESSAY';

interface Grade {
  number: number;
  nameUz: string;
  isActive: boolean;
}

interface Subject {
  id: string;
  code: string;
  nameUz: string;
  icon: string;
  color: string;
}

interface Topic {
  id: string;
  subjectId: string;
  titleUz: string;
  gradeNumber: number;
  quarter: number | null;
  subject: {
    nameUz: string;
    code: string;
  };
}

interface ContentItem {
  id: string;
  titleUz: string;
  content: any;
  difficulty?: string;
  durationMinutes?: number;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  type: {
    code: string;
    nameUz: string;
  };
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
}

interface TaskForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  questionText: string;
  answer: string;
  explanation: string;
  tags: string;
}

interface ProblemForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  problemText: string;
  solution: string;
  hint: string;
  tags: string;
}

interface TestForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: number;
  }[];
  tags: string;
}

interface QuestionForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  questionText: string;
  answerType: 'SHORT' | 'LONG' | 'MULTIPLE_CHOICE';
  correctAnswer?: string;
  options?: string[];
  tags: string;
}

interface OlympicForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  problemText: string;
  solution: string;
  points: number;
  tags: string;
}

interface PresentationForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  slides: {
    title: string;
    content: string;
  }[];
  tags: string;
}

interface MaterialForm {
  titleUz: string;
  topicId: string;
  difficulty: string;
  durationMinutes: number;
  contentText: string;
  fileUrl?: string;
  tags: string;
}

export default function AdminContentLibraryPage() {
  const router = useRouter();

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ContentType>('ALL');

  // Data
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newContentType, setNewContentType] = useState<ContentType | null>(null);
  const [taskSubType, setTaskSubType] = useState<TaskSubType | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Task Form
  const [taskForm, setTaskForm] = useState<TaskForm>({
    titleUz: '',
    topicId: '',
    difficulty: 'MEDIUM',
    durationMinutes: 10,
    questionText: '',
    answer: '',
    explanation: '',
    tags: '',
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (selectedGrade !== null) {
      loadSubjects(selectedGrade);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (selectedSubject && selectedGrade !== null) {
      loadTopics(selectedSubject, selectedGrade);
    }
  }, [selectedSubject, selectedGrade]);

  useEffect(() => {
    loadContentItems();
  }, [selectedGrade, selectedSubject, selectedTopic, selectedType]);

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
        loadGrades();
      }
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/');
    }
  };

  const loadGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      }
    } catch (error) {
      console.error('Load grades error:', error);
    }
  };

  const loadSubjects = async (grade: number) => {
    try {
      const response = await fetch(`/api/subjects?grade=${grade}`);
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error('Load subjects error:', error);
    }
  };

  const loadTopics = async (subjectCode: string, grade: number) => {
    try {
      const response = await fetch(`/api/topics?subjectCode=${subjectCode}&grade=${grade}`);
      const data = await response.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Load topics error:', error);
    }
  };

  const loadContentItems = async () => {
    setLoading(true);
    try {
      // Строим query string с фильтрами
      const params = new URLSearchParams();
      if (selectedGrade !== null) params.append('grade', selectedGrade.toString());
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedTopic) params.append('topic', selectedTopic);
      if (selectedType !== 'ALL') params.append('type', selectedType);

      const response = await fetch(`/api/content/items?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setContentItems(data.data);
      }
    } catch (error) {
      console.error('Load content error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: ContentType | TaskSubType | string): string => {
    const icons: Record<string, string> = {
      // Основные типы контента
      'ALL': 'solar:book-2-line-duotone',
      'PRESENTATION': 'solar:presentation-graph-line-duotone',
      'LESSON_PLAN': 'solar:clipboard-list-line-duotone',
      'TASK': 'solar:pen-new-square-line-duotone',
      // Подтипы задач
      'SINGLE_CHOICE': 'solar:check-circle-line-duotone',
      'MULTIPLE_CHOICE': 'solar:checklist-line-duotone',
      'TRUE_FALSE': 'solar:verified-check-line-duotone',
      'SHORT_ANSWER': 'solar:pen-line-duotone',
      'FILL_BLANKS': 'solar:text-square-line-duotone',
      'MATCHING': 'solar:link-line-duotone',
      'ESSAY': 'solar:document-text-line-duotone',
    };
    return icons[type] || 'solar:document-line-duotone';
  };

  const getTypeName = (type: ContentType | TaskSubType | string): string => {
    const names: Record<string, string> = {
      // Основные типы контента
      'ALL': 'Barchasi',
      'PRESENTATION': 'Taqdimot',
      'LESSON_PLAN': 'Dars rejasi',
      'TASK': 'Topshiriq',
      // Подтипы задач
      'SINGLE_CHOICE': 'Bir tanlov',
      'MULTIPLE_CHOICE': 'Koʻp tanlov',
      'TRUE_FALSE': 'Toʻgʻri/Notoʻgʻri',
      'SHORT_ANSWER': 'Qisqa javob',
      'FILL_BLANKS': 'Boʻshliqlarni toʻldirish',
      'MATCHING': 'Moslashtirish',
      'ESSAY': 'Kengaytirilgan javob',
    };
    return names[type] || type;
  };

  const openAddMaterialModal = (type: ContentType) => {
    setNewContentType(type);
    setShowAddModal(true);
  };

  const saveTask = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Валидация
    if (!taskForm.titleUz || !taskForm.topicId || !taskForm.questionText) {
      alert('Iltimos, barcha majburiy maydonlarni toʻldiring!');
      return;
    }

    try {
      const tagsArray = taskForm.tags
        ? taskForm.tags.split(',').map(t => t.trim()).filter(t => t)
        : [];

      const content = {
        questionText: taskForm.questionText,
        answer: taskForm.answer,
        explanation: taskForm.explanation,
      };

      const response = await fetch('/api/content/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          typeCode: 'TASK',
          topicId: taskForm.topicId,
          titleUz: taskForm.titleUz,
          content,
          difficulty: taskForm.difficulty,
          durationMinutes: taskForm.durationMinutes,
          tags: tagsArray,
          status: 'PUBLISHED',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Vazifa muvaffaqiyatli qoʻshildi!');
        setShowAddModal(false);
        setNewContentType(null);
        setTaskForm({
          titleUz: '',
          topicId: '',
          difficulty: 'MEDIUM',
          durationMinutes: 10,
          questionText: '',
          answer: '',
          explanation: '',
          tags: '',
        });
        loadContentItems();
      } else {
        alert('Xatolik: ' + data.message);
      }
    } catch (error) {
      console.error('Save task error:', error);
      alert('Vazifani saqlashda xatolik yuz berdi');
    }
  };

  // Umumiy save funksiyasi - barcha material turlari uchun
  const saveContent = async (contentData: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const isEditing = !!contentData.id;
      const url = '/api/content/items';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contentData),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEditing ? 'Material muvaffaqiyatli yangilandi!' : 'Material muvaffaqiyatli qoʻshildi!');
        setShowAddModal(false);
        setShowEditModal(false);
        setNewContentType(null);
        setEditingItem(null);
        loadContentItems();
      } else {
        alert('Xatolik: ' + data.message);
      }
    } catch (error) {
      console.error('Save content error:', error);
      alert('Materialni saqlashda xatolik yuz berdi');
    }
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const deleteContentItem = async (id: string) => {
    if (!confirm('Materialni oʻchirishga ishonchingiz komilmi?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/content/items?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert('Material muvaffaqiyatli oʻchirildi!');
        loadContentItems();
      } else {
        alert('Xatolik: ' + data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Materialni oʻchirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Kontent kutubxonasi
            </h1>
            <p className="text-gray-600 mt-1">Barcha oʻquv materiallari bir joyda</p>
          </div>
          <Link
            href="/admin"
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
            <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
            <span>Admin paneliga qaytish</span>
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinf
              </label>
              <select
                value={selectedGrade ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedGrade(val ? parseInt(val) : null);
                  setSelectedSubject('');
                  setSelectedTopic('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Barchasi</option>
                {grades.filter(g => g.isActive).map(grade => (
                  <option key={grade.number} value={grade.number}>
                    {grade.nameUz}
                  </option>
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
                  setSelectedTopic('');
                }}
                disabled={!selectedGrade}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Barchasi</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.code}>
                    {subject.icon} {subject.nameUz}
                  </option>
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
                disabled={!selectedSubject}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Barchasi</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.titleUz}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter - Custom Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tur
              </label>
              <button
                type="button"
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                onBlur={() => setTimeout(() => setIsTypeDropdownOpen(false), 200)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Icon icon={getTypeIcon(selectedType)} className="text-xl text-blue-500" />
                  <span className="text-gray-900 font-medium">{getTypeName(selectedType)}</span>
                </div>
                <Icon
                  icon={isTypeDropdownOpen ? "solar:alt-arrow-up-line-duotone" : "solar:alt-arrow-down-line-duotone"}
                  className="text-lg text-gray-400"
                />
              </button>

              {isTypeDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {(['ALL', 'PRESENTATION', 'LESSON_PLAN', 'TASK'] as ContentType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type);
                        setIsTypeDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 transition-colors ${
                        selectedType === type ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                      }`}
                    >
                      <Icon icon={getTypeIcon(type)} className="text-xl text-blue-500" />
                      <span className="font-medium">{getTypeName(type)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Material Button */}
          <div className="mt-4 pt-4 border-gray-200">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Icon icon="solar:add-square-bold-duotone" className="text-2xl" />
              <span>Material qoʻshish</span>
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Materiallar roʻyxati ({contentItems.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Yuklanmoqda...
            </div>
          ) : contentItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Material topilmadi
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sinf
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mavzu
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Icon icon={getTypeIcon(item.type.code)} className="text-2xl text-blue-500" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.titleUz}</div>
                        <div className="text-xs text-gray-500">{getTypeName(item.type.code)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.topic.gradeNumber}-sinf
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.subject.nameUz}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.topic.titleUz}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEditModal(item)}
                            className="group flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Icon icon="solar:pen-line-duotone" className="text-lg group-hover:hidden" />
                            <Icon icon="solar:pen-bold-duotone" className="text-lg hidden group-hover:block" />
                            <span>Tahrirlash</span>
                          </button>
                          <button
                            onClick={() => deleteContentItem(item.id)}
                            className="group flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Icon icon="solar:trash-bin-trash-line-duotone" className="text-lg group-hover:hidden" />
                            <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-lg hidden group-hover:block" />
                            <span>Oʻchirish</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Material Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                Material qoʻshish
              </h2>

              {/* Step 1: Choose Content Type */}
              {!newContentType && (
                <div>
                  <p className="text-gray-600 mb-4">Kontent turini tanlang:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['PRESENTATION', 'LESSON_PLAN', 'TASK'] as ContentType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => openAddMaterialModal(type)}
                        className="p-8 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                      >
                        <div className="mb-3">
                          <Icon icon={getTypeIcon(type)} className="text-5xl text-blue-500 mx-auto" />
                        </div>
                        <div className="font-bold text-lg">{getTypeName(type)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Task SubType (if TASK selected) */}
              {newContentType === 'TASK' && !taskSubType && (
                <div>
                  <button
                    onClick={() => setNewContentType(null)}
                    className="group mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
                  >
                    <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
                    <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
                    <span>Orqaga</span>
                  </button>
                  <p className="text-gray-600 mb-4">Topshiriq turini tanlang:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANKS', 'MATCHING', 'ESSAY'] as TaskSubType[]).map(subType => (
                      <button
                        key={subType}
                        onClick={() => setTaskSubType(subType)}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                      >
                        <div className="mb-2">
                          <Icon icon={getTypeIcon(subType)} className="text-3xl text-blue-500 mx-auto" />
                        </div>
                        <div className="font-medium text-sm">{getTypeName(subType)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Render Form based on type and subtype */}
              {((newContentType === 'PRESENTATION') || (newContentType === 'LESSON_PLAN') || (newContentType === 'TASK' && taskSubType)) && (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 flex items-center gap-2">
                      <Icon icon={getTypeIcon(taskSubType || newContentType)} className="text-2xl" />
                      <strong>
                        {getTypeName(taskSubType || newContentType)}
                      </strong> qoʻshish
                    </p>
                  </div>

                  {/* PRESENTATION Form */}
                  {newContentType === 'PRESENTATION' && (
                    <PresentationFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      onSave={saveContent}
                      onCancel={() => {
                        setNewContentType(null);
                        setTaskSubType(null);
                      }}
                    />
                  )}

                  {/* LESSON PLAN Form */}
                  {newContentType === 'LESSON_PLAN' && (
                    <LessonPlanFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      onSave={saveContent}
                      onCancel={() => {
                        setNewContentType(null);
                        setTaskSubType(null);
                      }}
                    />
                  )}

                  {/* TASK Forms - based on subtype */}
                  {newContentType === 'TASK' && taskSubType === 'SINGLE_CHOICE' && (
                    <SingleChoiceFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}

                  {newContentType === 'TASK' && taskSubType === 'MULTIPLE_CHOICE' && (
                    <MultipleChoiceFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}

                  {newContentType === 'TASK' && taskSubType === 'TRUE_FALSE' && (
                    <TrueFalseFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}

                  {newContentType === 'TASK' && taskSubType === 'SHORT_ANSWER' && (
                    <ShortAnswerFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}

                  {newContentType === 'TASK' && taskSubType === 'FILL_BLANKS' && (
                    <FillBlanksFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}

                  {newContentType === 'TASK' && taskSubType === 'MATCHING' && (
                    <MatchingFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}

                  {newContentType === 'TASK' && taskSubType === 'ESSAY' && (
                    <EssayFormComponent
                      topicId={selectedTopic || ''}
                      topics={topics}
                      taskSubType={taskSubType}
                      onSave={saveContent}
                      onCancel={() => setTaskSubType(null)}
                    />
                  )}
                </div>
              )}

              {/* Actions - faqat tur tanlanmagan bo'lsa */}
              {!newContentType && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold"
                  >
                    Yopish
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Material tahrirlash
                </h2>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
                    <strong>{getTypeIcon(editingItem.type.code)} {getTypeName(editingItem.type.code)}</strong> tahrirlash
                  </p>
                </div>

                {/* TASK Edit Form - Dynamic based on task_type */}
                {editingItem.type.code === 'TASK' && (() => {
                  const taskType = editingItem.content?.task_type;

                  // Render specific form based on task_type
                  if (taskType === 'SINGLE_CHOICE') {
                    return (
                      <SingleChoiceFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else if (taskType === 'MULTIPLE_CHOICE') {
                    return (
                      <MultipleChoiceFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else if (taskType === 'TRUE_FALSE') {
                    return (
                      <TrueFalseFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else if (taskType === 'SHORT_ANSWER') {
                    return (
                      <ShortAnswerFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else if (taskType === 'FILL_BLANKS') {
                    return (
                      <FillBlanksFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else if (taskType === 'MATCHING') {
                    return (
                      <MatchingFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else if (taskType === 'ESSAY') {
                    return (
                      <EssayFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  } else {
                    // Fallback for tasks without task_type or unknown types
                    return (
                      <ShortAnswerFormComponent
                        topicId={editingItem.topic.id}
                        topics={topics}
                        initialData={editingItem}
                        onSave={saveContent}
                        onCancel={() => setShowEditModal(false)}
                      />
                    );
                  }
                })()}

                {/* PROBLEM Edit Form */}
                {editingItem.type.code === 'PROBLEM' && (
                  <ProblemFormComponent
                    topicId={editingItem.topic.id}
                    topics={topics}
                    initialData={editingItem}
                    onSave={saveContent}
                    onCancel={() => setShowEditModal(false)}
                  />
                )}

                {/* TEST Edit Form */}
                {editingItem.type.code === 'TEST' && (
                  <TestFormComponent
                    topicId={editingItem.topic.id}
                    topics={topics}
                    initialData={editingItem}
                    onSave={saveContent}
                    onCancel={() => setShowEditModal(false)}
                  />
                )}

                {/* QUESTION Edit Form */}
                {editingItem.type.code === 'QUESTION' && (
                  <QuestionFormComponent
                    topicId={editingItem.topic.id}
                    topics={topics}
                    initialData={editingItem}
                    onSave={saveContent}
                    onCancel={() => setShowEditModal(false)}
                  />
                )}

                {/* MATERIAL Edit Form */}
                {editingItem.type.code === 'MATERIAL' && (
                  <MaterialFormComponent
                    topicId={editingItem.topic.id}
                    topics={topics}
                    initialData={editingItem}
                    onSave={saveContent}
                    onCancel={() => setShowEditModal(false)}
                  />
                )}

                {/* Note: TASK forms include their own buttons, no separate actions needed */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
