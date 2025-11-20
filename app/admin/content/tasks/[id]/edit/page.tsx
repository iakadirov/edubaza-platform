'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
} from '../../../ContentForms';

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
  topicId: string;
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

export default function TaskEditPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<Task | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadTask();
    loadTopics();
  }, [taskId]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/content/items?id=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setTask(data.data);
      } else {
        alert('Topshiriq topilmadi');
        router.push('/admin/content/tasks');
      }
    } catch (error) {
      console.error('Failed to load task:', error);
      alert('Topshiriqni yuklashda xatolik');
      router.push('/admin/content/tasks');
    } finally {
      setLoading(false);
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

  const handleSave = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/content/items`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Topshiriq muvaffaqiyatli yangilandi');
        router.push('/admin/content/tasks');
      } else {
        alert('Xatolik: ' + (data.message || 'Topshiriqni yangilashda xatolik'));
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Topshiriqni saqlashda xatolik yuz berdi');
    }
  };

  const handleCancel = () => {
    router.push('/admin/content/tasks');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Icon icon="solar:refresh-circle-bold-duotone" className="text-6xl text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const taskType = task.content?.task_type as TaskSubType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/content/tasks"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Icon icon="solar:arrow-left-bold-duotone" className="text-2xl" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <Icon icon={getTypeIcon(taskType)} className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Topshiriqni tahrirlash
                  </h1>
                  <p className="text-gray-600 mt-1">{getTypeName(taskType)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Task Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xs text-gray-600 mb-1">Sinf</div>
              <div className="font-semibold text-gray-900">{task.topic.gradeNumber}-sinf</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Fan</div>
              <div className="font-semibold text-gray-900">{task.subject.nameUz}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Mavzu</div>
              <div className="font-semibold text-gray-900">{task.topic.titleUz}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Qiyinlik</div>
              <div className={`font-semibold ${
                task.difficulty === 'EASY' ? 'text-green-600' :
                task.difficulty === 'HARD' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {task.difficulty === 'EASY' ? 'Oson' :
                 task.difficulty === 'HARD' ? 'Qiyin' : 'Oʻrta'}
              </div>
            </div>
          </div>

          {/* Render appropriate form based on task type */}
          {taskType === 'SINGLE_CHOICE' && (
            <SingleChoiceFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}

          {taskType === 'MULTIPLE_CHOICE' && (
            <MultipleChoiceFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}

          {taskType === 'TRUE_FALSE' && (
            <TrueFalseFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}

          {taskType === 'SHORT_ANSWER' && (
            <ShortAnswerFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}

          {taskType === 'FILL_BLANKS' && (
            <FillBlanksFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}

          {taskType === 'MATCHING' && (
            <MatchingFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}

          {taskType === 'ESSAY' && (
            <EssayFormComponent
              topicId={task.topicId}
              topics={topics}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={task}
            />
          )}
        </div>
      </div>
    </div>
  );
}
