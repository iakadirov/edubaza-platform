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

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
            break-inside: avoid;
            display: block;
            margin: 0 auto;
          }
          /* Better spacing for printed version */
          .task-card {
            margin-bottom: 1.5rem;
            padding: 1rem;
            border: 1px solid #e5e7eb;
          }
          /* Ensure colors print correctly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Remove hover effects for print */
          .hover\\:shadow-lg {
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
          }
          /* Better contrast for print */
          .bg-gray-50 {
            background-color: #fafafa !important;
          }
          .bg-blue-50 {
            background-color: #eff6ff !important;
          }
          .bg-green-50 {
            background-color: #f0fdf4 !important;
          }
          .bg-red-50 {
            background-color: #fef2f2 !important;
          }
          .bg-yellow-50 {
            background-color: #fefce8 !important;
          }
          /* Print header on every page */
          @page {
            @top-center {
              content: "EduBaza.uz";
            }
          }
        }
      `}} />
    </div>
  );
}
