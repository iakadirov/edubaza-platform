'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Worksheet {
  id: string;
  title: string;
  grade: number;
  subject: string;
  createdAt: string;
  tasksCount: number;
}

interface UserInfo {
  name: string | null;
  phone: string;
}

export default function UserWorksheetsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserInfo | null>(null);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch user info
      const userResponse = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser({
          name: userData.user.name,
          phone: userData.user.phone,
        });
      }

      // Fetch worksheets
      const worksheetsResponse = await fetch(`/api/admin/users/${userId}/worksheets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (worksheetsResponse.ok) {
        const worksheetsData = await worksheetsResponse.json();
        setWorksheets(worksheetsData.worksheets || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Ошибка при загрузке данных');
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
      fetchData();
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
      fetchData();
    } catch (error) {
      console.error('Error deleting worksheet:', error);
      alert('Ошибка при удалении worksheet');
    }
  };

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
          <Link
            href={`/admin/users/${userId}`}
            className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-flex"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
            <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
            <span>Назад к профилю</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Рабочие листы пользователя
          </h1>
          <p className="text-gray-600">
            {user?.name || 'Без имени'} ({user?.phone})
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Всего рабочих листов: {worksheets.length}
          </p>
        </div>

        {/* Worksheets Table */}
        {worksheets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-500 text-lg mb-2">
              У пользователя пока нет рабочих листов
            </div>
            <p className="text-sm text-gray-400">
              Рабочие листы будут отображаться здесь после создания
            </p>
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
                  {worksheets.map((worksheet) => (
                    <tr key={worksheet.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {worksheet.title}
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
                        {new Date(worksheet.createdAt).toLocaleDateString('ru-RU')}
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
                            Скачать PDF
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
