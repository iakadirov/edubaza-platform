'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
  };
  tasks: Task[];
  status: string;
  generatedAt: string;
  viewCount: number;
}

const taskTypeLabels: Record<string, string> = {
  SINGLE_CHOICE: '☑️ Bir tanlov',
  MULTIPLE_CHOICE: '✅ Koʻp tanlov',
  TRUE_FALSE: '✓✗ Toʻgʻri/Notoʻgʻri',
  SHORT_ANSWER: '✍️ Qisqa javob',
  FILL_BLANKS: '___ Boʻshliqlarni toʻldirish',
  MATCHING: '🔗 Moslashtirish',
  ESSAY: '📝 Kengaytirilgan javob',
};

const difficultyLabels: Record<string, string> = {
  EASY: 'Oson',
  MEDIUM: 'Oʻrta',
  HARD: 'Qiyin',
};

export default function WorksheetViewPage() {
  const router = useRouter();
  const params = useParams();
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

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
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              ← Boshqaruv paneliga qaytish
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showAnswers ? 'Javoblarni yashirish' : 'Javoblarni koʻrsatish'}
              </button>
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📄 Chop etish / PDF
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
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold mb-3">
              {worksheet.subject} • {worksheet.grade}-sinf
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {worksheet.topicUz}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600 text-sm">
              <span className="inline-flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full ${
                  worksheet.config.difficulty === 'EASY' ? 'bg-green-500' :
                  worksheet.config.difficulty === 'HARD' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}></span>
                {difficultyLabels[worksheet.config.difficulty] || worksheet.config.difficulty}
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
        <div className="space-y-6">
          {worksheet.tasks.map((task, index) => {
            const taskType = task.content.task_type || task.type;
            const questionText = task.content.questionText || task.content.statement || task.title;

            return (
              <div key={task.id || index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 break-inside-avoid border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-md font-medium border border-blue-200">
                        {taskTypeLabels[taskType] || taskType}
                      </span>
                      {task.difficulty && (
                        <span className={`text-xs px-3 py-1.5 rounded-md font-semibold ${
                          task.difficulty === 'EASY' ? 'bg-green-100 text-green-700 border border-green-200' :
                          task.difficulty === 'HARD' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {difficultyLabels[task.difficulty] || task.difficulty}
                        </span>
                      )}
                    </div>

                    <div className="mb-4 bg-gray-50 border-l-4 border-gray-300 pl-4 py-3 rounded-r">
                      <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed font-medium">
                        {questionText}
                      </p>
                    </div>

                    {/* Question Image */}
                    {task.content.questionImage && (
                      <div className="mb-5 flex justify-center">
                        <div className="relative inline-block">
                          <img
                            src={task.content.questionImage}
                            alt="Savol rasmi"
                            className="max-w-full h-auto rounded-lg border-4 border-gray-100 shadow-lg"
                            style={{ maxHeight: '400px' }}
                          />
                          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md print:hidden">
                            📸
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SINGLE_CHOICE or MULTIPLE_CHOICE */}
                    {(taskType === 'SINGLE_CHOICE' || taskType === 'MULTIPLE_CHOICE') && task.content.options && (
                      <div className="space-y-3 mb-5">
                        {task.content.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
                            <div className={`flex-shrink-0 w-6 h-6 mt-0.5 border-2 border-blue-400 bg-white ${
                              taskType === 'SINGLE_CHOICE' ? 'rounded-full' : 'rounded'
                            }`}></div>
                            <div className="flex-1">
                              <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="text-gray-800 font-medium">{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TRUE_FALSE */}
                    {taskType === 'TRUE_FALSE' && (
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-300 transition-all cursor-pointer">
                          <div className="flex-shrink-0 w-6 h-6 border-2 border-green-500 bg-white rounded"></div>
                          <span className="text-green-800 font-semibold">✓ Toʻgʻri</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg border-2 border-red-300 transition-all cursor-pointer">
                          <div className="flex-shrink-0 w-6 h-6 border-2 border-red-500 bg-white rounded"></div>
                          <span className="text-red-800 font-semibold">✗ Notoʻgʻri</span>
                        </div>
                      </div>
                    )}

                    {/* MATCHING */}
                    {taskType === 'MATCHING' && task.content.pairs && (
                      <div className="mb-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                              Chapdan tanlang
                            </div>
                            {task.content.pairs.map((pair, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300 shadow-sm">
                                <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">
                                  {idx + 1}
                                </span>
                                <span className="text-gray-800 font-medium">{pair.left}</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-3">
                            <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                              <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                              Oʻngdan tanlang
                            </div>
                            {task.content.pairs.map((pair, idx) => (
                              <div key={idx} className="p-3 bg-green-50 rounded-lg border-2 border-green-300 shadow-sm">
                                <span className="inline-block bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded mr-2">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="text-gray-800 font-medium">{pair.right}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FILL_BLANKS */}
                    {taskType === 'FILL_BLANKS' && task.content.textWithBlanks && (
                      <div className="mb-5">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-5 mb-5 shadow-inner">
                          <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed font-medium">
                            {task.content.textWithBlanks}
                          </p>
                        </div>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">✍</span>
                            Boʻshliqlarni toʻldiring:
                          </p>
                          {task.content.blanks && task.content.blanks.map((blank, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                {idx + 1}
                              </span>
                              <div className="flex-1 border-b-2 border-blue-400 pb-2 min-h-[36px] bg-white rounded-t px-2"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Answer space for SHORT_ANSWER, ESSAY */}
                    {(taskType === 'SHORT_ANSWER' || taskType === 'ESSAY' || (!taskType && taskType !== 'FILL_BLANKS')) && (
                      <div className="border-t-2 border-gray-300 pt-5 mt-5">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">✍</span>
                          Javob yozing:
                        </p>
                        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 ${
                          taskType === 'ESSAY' ? 'min-h-[160px]' : 'min-h-[80px]'
                        }`}>
                          {/* Lines for writing */}
                          {Array.from({ length: taskType === 'ESSAY' ? 6 : 3 }).map((_, lineIdx) => (
                            <div key={lineIdx} className="border-b border-gray-300 h-8 mb-2"></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show answers if enabled */}
                    {showAnswers && task.content && (
                      <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded print:hidden">
                        {task.content.correctAnswer !== undefined && (
                          <>
                            <p className="text-sm font-semibold text-green-800 mb-1">
                              ✓ Toʻgʻri javob:
                            </p>
                            <p className="text-green-700 mb-2">
                              {typeof task.content.correctAnswer === 'number'
                                ? (task.content.options?.[task.content.correctAnswer] || task.content.correctAnswer)
                                : task.content.correctAnswer === true ? 'Toʻgʻri'
                                : task.content.correctAnswer === false ? 'Notoʻgʻri'
                                : task.content.correctAnswer}
                            </p>
                          </>
                        )}
                        {task.content.answer && (
                          <>
                            <p className="text-sm font-semibold text-green-800 mb-1">
                              ✓ Javob:
                            </p>
                            <p className="text-green-700 mb-2">{task.content.answer}</p>
                          </>
                        )}
                        {taskType === 'FILL_BLANKS' && task.content.blanks && (
                          <>
                            <p className="text-sm font-semibold text-green-800 mb-1">
                              ✓ Toʻgʻri javoblar:
                            </p>
                            <div className="space-y-1">
                              {task.content.blanks.map((blank, idx) => (
                                <p key={idx} className="text-green-700">
                                  {idx + 1}. {blank.correctAnswer}
                                  {blank.acceptableAnswers && blank.acceptableAnswers.length > 0 && (
                                    <span className="text-green-600 text-sm ml-2">
                                      (yoki: {blank.acceptableAnswers.join(', ')})
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          </>
                        )}
                        {task.content.explanation && (
                          <>
                            <p className="text-sm font-semibold text-green-800 mt-3 mb-1">
                              💡 Tushuntirish:
                            </p>
                            <p className="text-green-700 whitespace-pre-wrap">{task.content.explanation}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

          /* Watermark - edubaza repeated pattern */
          main::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: repeating-linear-gradient(
              -15deg,
              transparent,
              transparent 100px,
              rgba(23, 97, 255, 0.03) 100px,
              rgba(23, 97, 255, 0.03) 125px
            );
            pointer-events: none;
            z-index: 0;
          }

          /* Header: 543x77px, centered, 26px from top */
          .bg-white.rounded-lg.shadow-sm.p-8 {
            width: 543px !important;
            height: 77px !important;
            margin: 26px auto 10px auto !important;
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
            width: 543px !important;
            margin: 0 auto !important;
            padding: 0 26px !important;
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

          /* Options - horizontal layout with gap */
          .space-y-3 {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 23px !important;
            margin: 0 !important;
          }

          .space-y-3 > * {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          .space-y-3 > * + * {
            margin-top: 0 !important;
          }

          /* Option text */
          .space-y-3 span {
            font-size: 10px !important;
            line-height: 13px !important;
            font-weight: 400 !important;
            color: #000000 !important;
          }

          /* Hide checkboxes */
          .w-6.h-6 {
            display: none !important;
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

          /* Answer lines */
          .border-b.border-gray-300.h-8 {
            height: 0 !important;
            border: none !important;
            display: none !important;
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
