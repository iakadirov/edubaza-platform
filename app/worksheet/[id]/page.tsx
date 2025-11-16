'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface TaskContent {
  task_type?: string;
  questionText?: string;
  statement?: string;
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
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {worksheet.topicUz}
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600">
              <span>{worksheet.subject}</span>
              <span>•</span>
              <span>{worksheet.grade}-sinf</span>
              <span>•</span>
              <span>{difficultyLabels[worksheet.config.difficulty] || worksheet.config.difficulty}</span>
              <span>•</span>
              <span>{worksheet.tasks.length} ta topshiriq</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Yaratilgan sana:</strong> {new Date(worksheet.generatedAt).toLocaleDateString('uz-UZ')}
              </div>
              <div className="print:hidden">
                <strong>Koʻrishlar:</strong> {worksheet.viewCount}
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
              <div key={task.id || index} className="bg-white rounded-lg shadow-sm p-6 break-inside-avoid">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded">
                        {taskTypeLabels[taskType] || taskType}
                      </span>
                      {task.difficulty && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                          task.difficulty === 'HARD' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {difficultyLabels[task.difficulty] || task.difficulty}
                        </span>
                      )}
                    </div>

                    <p className="text-lg text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">
                      {questionText}
                    </p>

                    {/* SINGLE_CHOICE or MULTIPLE_CHOICE */}
                    {(taskType === 'SINGLE_CHOICE' || taskType === 'MULTIPLE_CHOICE') && task.content.options && (
                      <div className="space-y-2 mb-4">
                        {task.content.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                            <div className={`flex-shrink-0 w-5 h-5 mt-0.5 border-2 border-gray-300 ${
                              taskType === 'SINGLE_CHOICE' ? 'rounded-full' : 'rounded'
                            }`}></div>
                            <span className="text-gray-700">{String.fromCharCode(65 + optIndex)}) {option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TRUE_FALSE */}
                    {taskType === 'TRUE_FALSE' && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                          <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded"></div>
                          <span className="text-gray-700">Toʻgʻri</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                          <div className="flex-shrink-0 w-5 h-5 border-2 border-gray-300 rounded"></div>
                          <span className="text-gray-700">Notoʻgʻri</span>
                        </div>
                      </div>
                    )}

                    {/* MATCHING */}
                    {taskType === 'MATCHING' && task.content.pairs && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          {task.content.pairs.map((pair, idx) => (
                            <div key={idx} className="p-2 bg-blue-50 rounded border border-blue-200">
                              {idx + 1}. {pair.left}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {task.content.pairs.map((pair, idx) => (
                            <div key={idx} className="p-2 bg-green-50 rounded border border-green-200">
                              {String.fromCharCode(65 + idx)}. {pair.right}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FILL_BLANKS */}
                    {taskType === 'FILL_BLANKS' && task.content.textWithBlanks && (
                      <div className="mb-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {task.content.textWithBlanks}
                          </p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Boʻshliqlarni toʻldiring:</p>
                          {task.content.blanks && task.content.blanks.map((blank, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center font-medium text-sm">
                                {idx + 1}
                              </span>
                              <div className="flex-1 border-b-2 border-gray-300 pb-1 min-h-[32px]"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Answer space for SHORT_ANSWER, ESSAY */}
                    {(taskType === 'SHORT_ANSWER' || taskType === 'ESSAY' || (!taskType && taskType !== 'FILL_BLANKS')) && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-sm text-gray-500 mb-2">Javob:</p>
                        <div className="border border-gray-300 rounded p-3 min-h-[80px] bg-gray-50"></div>
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
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
}
