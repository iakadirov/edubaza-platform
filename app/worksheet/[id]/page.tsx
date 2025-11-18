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
  };
  tasks: Task[];
  status: string;
  generatedAt: string;
  viewCount: number;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header - hide on print */}
        <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="group flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Icon icon="solar:arrow-left-line-duotone" className="text-lg group-hover:hidden" />
              <Icon icon="solar:arrow-left-bold-duotone" className="text-lg hidden group-hover:block" />
              <span>Boshqaruv paneliga qaytish</span>
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => setInteractive(!interactive)}
                className={`flex items-center gap-2 ${interactive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white px-4 py-2 rounded-lg transition-colors`}
              >
                <Icon icon={interactive ? 'solar:pen-new-square-bold-duotone' : 'solar:document-bold-duotone'} className="text-xl" />
                <span>{interactive ? 'Interfaol rejim' : 'Ko\'rish rejimi'}</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Icon icon="solar:download-bold-duotone" className="text-xl" />
                <span>PDF yuklash</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Icon icon="solar:printer-bold-duotone" className="text-xl" />
                <span>Chop etish</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Worksheet Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border-t-4 border-blue-600">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {generateWorksheetTitle(
                worksheet.topicUz,
                worksheet.subject,
                worksheet.grade,
                worksheet.config?.quarter,
                worksheet.config?.week
              )}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600 text-sm">
              <span className="inline-flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full ${
                  worksheet.config.difficulty === 'EASY' ? 'bg-green-500' :
                  worksheet.config.difficulty === 'HARD' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></span>
                {worksheet.config.difficulty === 'EASY' ? 'Oson' :
                 worksheet.config.difficulty === 'HARD' ? 'Qiyin' :
                 worksheet.config.difficulty === 'MEDIUM' ? 'Oʻrta' :
                 worksheet.config.difficulty}
              </span>
              <span>•</span>
              <span className="font-semibold">{worksheet.tasks.length} ta topshiriq</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong className="text-gray-700">Sana:</strong> {new Date(worksheet.generatedAt).toLocaleDateString('uz-UZ')}
              </div>
              <div className="print:hidden">
                <strong className="text-gray-700">Koʻrishlar:</strong> {worksheet.viewCount}
              </div>
            </div>
          </div>

          {/* Student Info Section for Print */}
          <div className="hidden print:block border-t border-gray-200 mt-4 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Oʻquvchi F.I.Sh.:</strong> _________________________________
              </div>
              <div>
                <strong>Sana:</strong> _________________________________
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-[5px]">
          {worksheet.tasks.map((task, index) => (
            <TaskRenderer
              key={task.id}
              task={task}
              index={index}
              interactive={interactive}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="hidden print:block">EduBaza.uz yordamida yaratildi - oʻquv materiallari platformasi</p>
          <p className="hidden print:block mt-1">{new Date().toLocaleDateString('uz-UZ')}</p>
        </div>
      </main>

      {/* Print styles - Figma A4 Design */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Onest', -apple-system, BlinkMacSystemFont, sans-serif !important;
          }

          body {
            background: #F0F5FF !important;
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4;
            margin: 10px;
          }

          /* A4 Page Container: 595x842px */
          main {
            max-width: 595px !important;
            min-height: 842px !important;
            background: #FFFFFF !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
            position: relative;
          }

          /* Header: 575x77px, centered, 10px from top */
          .bg-white.rounded-lg.shadow-sm.p-8 {
            width: 575px !important;
            height: 77px !important;
            margin: 10px auto 10px auto !important;
            padding: 12px !important;
            border: 0.5px solid #E9E9E9 !important;
            border-radius: 6px !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 15px !important;
            position: relative;
            z-index: 1;
          }

          /* Hide subject badge */
          .inline-block.bg-blue-100 {
            display: none !important;
          }

          /* Title */
          h1 {
            font-size: 14px !important;
            line-height: 18px !important;
            font-weight: 600 !important;
            text-align: center !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide difficulty and count */
          h1 + div {
            display: none !important;
          }

          /* Student info fields */
          .border-t.border-gray-200 {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 19px !important;
            width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .border-t.border-gray-200 > div {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 4px !important;
            margin: 0 !important;
          }

          .border-t.border-gray-200 strong {
            font-size: 12px !important;
            line-height: 15px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
          }

          /* Task Cards */
          .space-y-6 {
            width: 575px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            position: relative;
            z-index: 1;
          }

          .space-y-6 > * + * {
            margin-top: 0 !important;
          }

          /* Individual task card */
          .bg-white.rounded-lg.shadow-md {
            width: 100% !important;
            padding: 12px !important;
            border: 0.5px solid #E9E9E9 !important;
            border-radius: 6px !important;
            box-shadow: none !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 13px !important;
          }

          /* Task number circle: 15x15px */
          .w-10.h-10 {
            width: 15px !important;
            height: 15px !important;
            min-width: 15px !important;
            min-height: 15px !important;
            background: #BEDAFF !important;
            border-radius: 39px !important;
            font-size: 8px !important;
            line-height: 10px !important;
            font-weight: 700 !important;
            color: #00275B !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: none !important;
          }

          /* Hide task type badges */
          .mb-4.flex.items-center {
            display: none !important;
          }

          /* Question text */
          .mb-4.bg-gray-50 {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .text-lg {
            font-size: 10px !important;
            line-height: 13px !important;
            font-weight: 400 !important;
            color: #000000 !important;
          }

          /* Images: 122.57x74.69px */
          img {
            max-width: 122.57px !important;
            max-height: 74.69px !important;
            width: 122.57px !important;
            height: 74.69px !important;
            border-radius: 5.75px !important;
            border: none !important;
            box-shadow: none !important;
            object-fit: cover !important;
          }

          .mb-5.flex.justify-center {
            justify-content: flex-start !important;
            margin: 0 !important;
          }

          /* Options - horizontal layout with gap and flex-wrap */
          .space-y-3.mb-5 {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 15px 23px !important;
            margin: 0 !important;
            align-items: flex-start !important;
          }

          .space-y-3.mb-5 > * {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            flex: 0 0 auto !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
          }

          .space-y-3.mb-5 > * + * {
            margin-top: 0 !important;
          }

          /* Option text */
          .space-y-3 span {
            font-size: 10px !important;
            line-height: 13px !important;
            font-weight: 400 !important;
            color: #000000 !important;
          }

          /* Checkboxes for MULTIPLE_CHOICE - show small squares */
          .flex-shrink-0.w-6.h-6 {
            width: 8px !important;
            height: 8px !important;
            min-width: 8px !important;
            min-height: 8px !important;
            border: 1px solid #000000 !important;
            border-radius: 2px !important;
            background: white !important;
            display: inline-block !important;
          }

          /* TRUE_FALSE checkboxes */
          .grid.grid-cols-2 .w-6.h-6 {
            width: 8px !important;
            height: 8px !important;
            min-width: 8px !important;
            min-height: 8px !important;
            border: 1px solid #000000 !important;
            border-radius: 2px !important;
            background: white !important;
            display: inline-block !important;
          }

          /* TRUE/FALSE grid */
          .grid.grid-cols-2.gap-3 {
            display: flex !important;
            flex-direction: row !important;
            gap: 23px !important;
          }

          .grid.grid-cols-2 > div {
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
          }

          /* Matching pairs - hide headers */
          .text-sm.font-semibold {
            display: none !important;
          }

          /* FILL_BLANKS gradient box */
          .bg-gradient-to-r {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          /* SHORT_ANSWER - single line */
          .border-t-2.border-gray-300 {
            border: none !important;
            padding: 0 !important;
            margin: 6px 0 0 0 !important;
          }

          .border-t-2.border-gray-300 p {
            display: none !important;
          }

          .border-t-2.border-gray-300 > div {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 0 !important;
          }

          /* Answer line for SHORT_ANSWER */
          .border-t-2.border-gray-300 .border-b.border-gray-300:first-child {
            display: block !important;
            height: 15px !important;
            border: none !important;
            border-bottom: 1px solid #000000 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          /* Hide other lines */
          .border-t-2.border-gray-300 .border-b.border-gray-300:not(:first-child) {
            display: none !important;
          }

          /* FILL_BLANKS - horizontal auto layout */
          .space-y-3.bg-gray-50 {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 6px 0 0 0 !important;
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 8px 15px !important;
          }

          .space-y-3.bg-gray-50 > p {
            display: none !important;
          }

          .space-y-3.bg-gray-50 > div {
            flex: 0 0 auto !important;
            width: auto !important;
            min-width: 60px !important;
            max-width: 120px !important;
          }

          .space-y-3.bg-gray-50 .w-8.h-8 {
            width: 12px !important;
            height: 12px !important;
            font-size: 8px !important;
            background: #BEDAFF !important;
            color: #00275B !important;
          }

          .space-y-3.bg-gray-50 .border-b-2 {
            border-bottom: 1px solid #000000 !important;
            min-height: 15px !important;
            height: 15px !important;
            padding: 0 !important;
            background: transparent !important;
          }

          /* ESSAY - 3 lines */
          .border-t-2.border-gray-300 .border-b.border-gray-300 {
            display: block !important;
            height: 15px !important;
            border: none !important;
            border-bottom: 1px solid #000000 !important;
            margin-bottom: 4px !important;
            width: 100% !important;
          }

          .min-h-\\[160px\\] .border-b.border-gray-300:nth-child(1),
          .min-h-\\[160px\\] .border-b.border-gray-300:nth-child(2),
          .min-h-\\[160px\\] .border-b.border-gray-300:nth-child(3) {
            display: block !important;
          }

          .min-h-\\[160px\\] .border-b.border-gray-300:nth-child(n+4) {
            display: none !important;
          }

          /* MATCHING - 2 columns with center space */
          .grid.grid-cols-2.gap-4:not(.gap-3) {
            display: grid !important;
            grid-template-columns: 1fr 30px 1fr !important;
            gap: 0 !important;
            margin: 0 !important;
          }

          .grid.grid-cols-2.gap-4:not(.gap-3) > div:first-child {
            grid-column: 1 !important;
          }

          .grid.grid-cols-2.gap-4:not(.gap-3) > div:last-child {
            grid-column: 3 !important;
          }

          .grid.grid-cols-2.gap-4:not(.gap-3) .space-y-3 {
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }

          .grid.grid-cols-2.gap-4:not(.gap-3) .p-3 {
            font-size: 10px !important;
            line-height: 13px !important;
          }

          /* Compact all margins */
          .p-3, .p-4, .p-5, .p-6 {
            padding: 0 !important;
          }

          .mb-3, .mb-4, .mb-5, .mb-6 {
            margin-bottom: 6px !important;
          }

          .mt-3, .mt-4, .mt-5 {
            margin-top: 6px !important;
          }

          .gap-2, .gap-3, .gap-4 {
            gap: 4px !important;
          }

          /* Break inside avoid */
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />
      </div>
    </>
  );
}
