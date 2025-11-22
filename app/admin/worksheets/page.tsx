'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/date-format';

interface Worksheet {
  id: string;
  title: string;
  grade: number;
  subject: string;
  createdAt: string;
  tasksCount: number;
  userName: string | null;
  userPhone: string;
}

export default function AllWorksheetsPage() {
  const router = useRouter();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<number | 'ALL'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  useEffect(() => {
    fetchWorksheets();
  }, []);

  const fetchWorksheets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/worksheets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch worksheets');
      }

      const data = await response.json();
      setWorksheets(data.worksheets || []);
    } catch (error) {
      console.error('Error fetching worksheets:', error);
      alert('Ошибка при загрузке рабочих листов');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (worksheetId: string, title: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/worksheets/${worksheetId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Ошибка при скачивании PDF');
    }
  };

  const handlePublishWorksheet = async (worksheetId: string, title: string) => {
    if (!confirm(`Опубликовать worksheet "${title}" на сайте?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/worksheets/${worksheetId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to publish worksheet');
      }

      alert('Worksheet успешно опубликован');
      fetchWorksheets();
    } catch (error) {
      console.error('Error publishing worksheet:', error);
      alert('Ошибка при публикации worksheet');
    }
  };

  const handleDeleteWorksheet = async (worksheetId: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить worksheet "${title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/worksheets/${worksheetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete worksheet');
      }

      alert('Worksheet успешно удален');
      fetchWorksheets();
    } catch (error) {
      console.error('Error deleting worksheet:', error);
      alert('Ошибка при удалении worksheet');
    }
  };

  const filteredWorksheets = worksheets.filter(worksheet => {
    const matchesSearch = !searchQuery ||
      worksheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worksheet.userName && worksheet.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      worksheet.userPhone.includes(searchQuery);

    const matchesGrade = gradeFilter === 'ALL' || worksheet.grade === gradeFilter;
    const matchesSubject = subjectFilter === 'ALL' || worksheet.subject === subjectFilter;

    return matchesSearch && matchesGrade && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(worksheets.map(w => w.subject)));

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Все рабочие листы
          </h1>
          <p className="text-gray-600">
            Всего рабочих листов: {worksheets.length}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, пользователю..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Класс
              </label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Все классы</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(grade => (
                  <option key={grade} value={grade}>{grade} класс</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Предмет
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">Все предметы</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Worksheets Table */}
        {filteredWorksheets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-lg mb-2">
              {searchQuery || gradeFilter !== 'ALL' || subjectFilter !== 'ALL'
                ? 'Рабочие листы не найдены'
                : 'Пока нет рабочих листов'}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Класс
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Предмет
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Задач
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Дата создания
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWorksheets.map((worksheet) => (
                    <tr key={worksheet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {worksheet.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {worksheet.userName || 'Без имени'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {worksheet.userPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {worksheet.grade} класс
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {worksheet.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {worksheet.tasksCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(worksheet.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <a
                            href={`/worksheet/${worksheet.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            Посмотреть
                          </a>
                          <button
                            onClick={() => handleDownloadPDF(worksheet.id, worksheet.title)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handlePublishWorksheet(worksheet.id, worksheet.title)}
                            className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
                          >
                            Опубликовать
                          </button>
                          <button
                            onClick={() => handleDeleteWorksheet(worksheet.id, worksheet.title)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
