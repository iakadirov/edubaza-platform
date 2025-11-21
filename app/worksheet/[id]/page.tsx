'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { TaskRenderer } from '@/components/worksheet/TaskRenderer';
import { generateWorksheetTitle } from '@/lib/worksheet-title';

interface TaskContent {
  task_type?: string;
  questionText?: string;
  statement?: string;
  questionImage?: string;
  options?: string[];
  correctAnswer?: number | boolean | string;
  answer?: string;
  explanation?: string;
  pairs?: Array<{ left: string; right: string }>;
  blanks?: Array<{ correctAnswer: string; acceptableAnswers: string[] }>;
  textWithBlanks?: string;
}

interface Task {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  content: TaskContent;
  topic: string;
  subject: string;
  metadata?: {
    isAiGenerated?: boolean;
    generatedAt?: string;
    approved?: boolean;
  };
}

interface Worksheet {
  id: string;
  subject: string;
  grade: number;
  topicUz: string;
  config: {
    taskCount: number;
    difficulty: string;
    taskTypes: string[];
    quarter?: number;
    week?: number;
    aiPercentage?: number;
  };
  tasks: Task[];
  status: string;
  generatedAt: string;
  viewCount: number;
  aiDebugInfo?: {
    params: any;
    systemInstruction: string;
    userPrompt: string;
    rawResponse: string;
    parseError?: string;
    timestamp: string;
  };
}

export default function WorksheetViewPage() {
  const router = useRouter();
  const params = useParams();
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const worksheetId = params.id;

    fetch(`/api/worksheets/${worksheetId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWorksheet(data.data);
        } else {
          alert(data.message);
          router.push('/dashboard');
        }
      })
      .catch(error => {
        console.error('Failed to fetch worksheet:', error);
        router.push('/dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bu topshiriqni oʻchirib tashlamoqchimisiz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/worksheets/${params.id}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && worksheet) {
        // Remove task from local state
        setWorksheet({
          ...worksheet,
          tasks: worksheet.tasks.filter(t => t.id !== taskId),
        });
        alert('Topshiriq muvaffaqiyatli oʻchirildi');
      } else {
        alert(data.message || 'Topshiriqni oʻchirishda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Topshiriqni oʻchirishda xatolik yuz berdi');
    }
  };

  const handleEditTask = (taskId: string) => {
    // TODO: Open edit modal or navigate to edit page
    alert('Tahrirlash funksiyasi tez orada qoʻshiladi');
  };

  const handleRegenerateTask = async (taskId: string) => {
    if (!confirm('Bu topshiriqni qayta yaratmoqchimisiz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/worksheets/${params.id}/tasks/${taskId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && worksheet) {
        // Replace task in local state
        setWorksheet({
          ...worksheet,
          tasks: worksheet.tasks.map(t =>
            t.id === taskId ? data.data : t
          ),
        });
        alert('Topshiriq muvaffaqiyatli qayta yaratildi');
      } else {
        alert(data.message || 'Topshiriqni qayta yaratishda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error regenerating task:', error);
      alert('Topshiriqni qayta yaratishda xatolik yuz berdi');
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/worksheets/${params.id}/tasks/${taskId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && worksheet) {
        // Update task approval status in local state
        setWorksheet({
          ...worksheet,
          tasks: worksheet.tasks.map(t =>
            t.id === taskId && t.metadata
              ? { ...t, metadata: { ...t.metadata, approved: true } }
              : t
          ),
        });
      } else {
        alert(data.message || 'Topshiriqni tasdiqlashda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error approving task:', error);
      alert('Topshiriqni tasdiqlashda xatolik yuz berdi');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/worksheets/${params.id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `worksheet_${params.id}.pdf`; // fallback

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('PDF yuklab olishda xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Icon
            icon="solar:refresh-circle-bold-duotone"
            className="text-6xl text-blue-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!worksheet) {
    return null;
  }

  return (
    <>
      {/* Google Fonts - Onest */}
      <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-white">
        {/* Header - hide on print */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 print:hidden shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <Icon icon="solar:arrow-left-bold-duotone" className="text-2xl" />
              <span className="font-medium">Boshqaruv paneliga qaytish</span>
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => setInteractive(!interactive)}
                className={`flex items-center gap-2 ${interactive ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105`}
              >
                <Icon icon={interactive ? 'solar:pen-new-square-bold-duotone' : 'solar:document-bold-duotone'} className="text-xl" />
                <span>{interactive ? 'Interfaol rejim' : 'Koʻrish rejimi'}</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Icon icon="solar:download-bold-duotone" className="text-xl" />
                <span>PDF yuklash</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Icon icon="solar:printer-bold-duotone" className="text-xl" />
                <span>Chop etish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Worksheet Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-gradient-to-r from-blue-600 to-purple-600 print:shadow-none print:rounded-none print:border-0 print:p-0 print:mb-4">
          {/* Web version - detailed */}
          <div className="print:hidden">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Icon icon="solar:document-text-bold-duotone" className="text-3xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {generateWorksheetTitle(
                  worksheet.topicUz,
                  worksheet.subject,
                  worksheet.grade,
                  worksheet.config?.quarter,
                  worksheet.config?.week
                )}
              </h1>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                  worksheet.config.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                  worksheet.config.difficulty === 'HARD' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  <Icon icon={
                    worksheet.config.difficulty === 'EASY' ? 'solar:smile-circle-bold-duotone' :
                    worksheet.config.difficulty === 'HARD' ? 'solar:fire-bold-duotone' :
                    'solar:emoji-funny-square-bold-duotone'
                  } className="text-xl" />
                  {worksheet.config.difficulty === 'EASY' ? 'Oson' :
                   worksheet.config.difficulty === 'HARD' ? 'Qiyin' :
                   worksheet.config.difficulty === 'MEDIUM' ? 'Oʻrta' :
                   worksheet.config.difficulty}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
                  <Icon icon="solar:list-check-bold-duotone" className="text-xl" />
                  {worksheet.tasks.length} ta topshiriq
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <Icon icon="solar:calendar-bold-duotone" className="text-2xl text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Yaratilgan sana</p>
                  <p className="font-semibold text-gray-800">{new Date(worksheet.generatedAt).toLocaleDateString('uz-UZ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                <Icon icon="solar:eye-bold-duotone" className="text-2xl text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Koʻrishlar</p>
                  <p className="font-semibold text-gray-800">{worksheet.viewCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Print version - simplified */}
          <div className="hidden print:block border border-gray-300 rounded-lg p-4">
            <h1 className="text-center text-xl font-bold text-gray-900 mb-3">
              {generateWorksheetTitle(
                worksheet.topicUz,
                worksheet.subject,
                worksheet.grade,
                worksheet.config?.quarter,
                worksheet.config?.week
              )}
            </h1>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <strong>F.I.Sh.:</strong>
                <div style={{
                  width: '200px',
                  height: '20px',
                  borderBottom: '1px solid #000',
                  display: 'inline-block'
                }}></div>
              </div>
              <div className="flex items-center gap-2">
                <strong>Sinf:</strong>
                <div style={{
                  width: '100px',
                  height: '20px',
                  borderBottom: '1px solid #000',
                  display: 'inline-block'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-6 print:space-y-3">
          {worksheet.tasks.map((task, index) => (
            <TaskRenderer
              key={task.id}
              task={task}
              index={index}
              interactive={interactive}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
              onRegenerate={handleRegenerateTask}
              onApprove={handleApproveTask}
            />
          ))}
        </div>

        {/* AI Debug Info Section */}
        {worksheet?.aiDebugInfo && (
          <div className="mt-12 print:hidden">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Icon icon="solar:code-bold-duotone" className="text-2xl text-white" />
                  <h2 className="text-xl font-bold text-white">AI Generation Debug Logs</h2>
                </div>
                <p className="text-sm text-purple-100 mt-1">Информация о промпте и ответе AI для отладки</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Parameters */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Icon icon="solar:settings-bold-duotone" className="text-blue-400" />
                    Параметры генерации
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-gray-700">
                    {JSON.stringify(worksheet.aiDebugInfo.params, null, 2)}
                  </pre>
                </div>

                {/* System Instruction */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Icon icon="solar:document-bold-duotone" className="text-green-400" />
                    System Instruction ({worksheet.aiDebugInfo.systemInstruction.length} символов)
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto max-h-96 border border-gray-700">
                    {worksheet.aiDebugInfo.systemInstruction}
                  </pre>
                </div>

                {/* User Prompt */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Icon icon="solar:chat-round-bold-duotone" className="text-yellow-400" />
                    User Prompt ({worksheet.aiDebugInfo.userPrompt.length} символов)
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto max-h-96 border border-gray-700">
                    {worksheet.aiDebugInfo.userPrompt}
                  </pre>
                </div>

                {/* Raw Response */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Icon icon="solar:code-square-bold-duotone" className="text-purple-400" />
                    AI Response ({worksheet.aiDebugInfo.rawResponse.length} символов)
                  </h3>
                  <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto max-h-96 border border-gray-700">
                    {worksheet.aiDebugInfo.rawResponse}
                  </pre>
                </div>

                {/* Parse Error (if any) */}
                {worksheet.aiDebugInfo.parseError && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <Icon icon="solar:danger-triangle-bold-duotone" />
                      Parse Error
                    </h3>
                    <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg text-sm text-red-300">
                      {worksheet.aiDebugInfo.parseError}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 text-right">
                  Generated at: {new Date(worksheet.aiDebugInfo.timestamp).toLocaleString('ru-RU')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm print:hidden">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon icon="solar:star-bold-duotone" className="text-yellow-500 text-lg" />
            <p className="font-medium text-gray-600">EduBaza.uz yordamida yaratildi</p>
            <Icon icon="solar:star-bold-duotone" className="text-yellow-500 text-lg" />
          </div>
          <p className="text-xs text-gray-400">Oʻquv materiallari platformasi</p>
        </div>
        <div className="hidden print:block mt-8 text-center text-gray-500 text-sm">
          <p>EduBaza.uz yordamida yaratildi - oʻquv materiallari platformasi</p>
          <p className="mt-1">{new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
      </main>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            background: white !important;
          }

          @page {
            size: A4;
            margin: 24px;
          }

          main {
            max-width: 1280px !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Font sizes */
          h1 {
            font-size: 20px !important;
          }

          .text-base {
            font-size: 16px !important;
          }

          .text-lg {
            font-size: 16px !important;
          }

          .text-sm {
            font-size: 16px !important;
          }

          .text-xs {
            font-size: 16px !important;
          }

          .text-gray-900,
          .text-gray-800,
          .text-gray-700 {
            font-size: 16px !important;
          }

          .text-blue-600 {
            font-size: 14px !important;
            margin-top: 0 !important;
          }

          strong,
          .font-semibold {
            font-size: 16px !important;
          }

          .hidden.print\\:block p {
            font-size: 18px !important;
          }

          /* Header card - same as task cards */
          .hidden.print\\:block.border {
            border: 0.125px solid #D9D9D9 !important;
            padding: 12px !important;
            margin-bottom: 12px !important;
            width: 100% !important;
          }

          /* Task number circles - 25% bigger than before (20px -> 25px) */
          .space-y-6 > div > div > div:first-child {
            width: 25px !important;
            height: 25px !important;
            font-size: 12px !important;
            line-height: 25px !important;
          }

          /* Task card borders - 0.125px with #D9D9D9 color */
          .space-y-6 > div {
            border: 0.125px solid #D9D9D9 !important;
            box-shadow: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />
      </div>
    </>
  );
}
