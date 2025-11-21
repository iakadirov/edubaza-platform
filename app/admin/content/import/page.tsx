'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function ImportTasksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [parsedTask, setParsedTask] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Parse LaTeX-like format
  const parseTask = () => {
    try {
      setError('');
      setParsedTask(null);

      // Extract task type
      const typeMatch = taskText.match(/\\begin\{([A-Z_]+)\}/);
      if (!typeMatch) {
        setError('Format xato: \\begin{TASK_TYPE} topilmadi');
        return;
      }
      const taskType = typeMatch[1];

      // Extract difficulty
      const difficultyMatch = taskText.match(/Qiyinlik darajasi:\s*(Oson|O'rta|Qiyin)/);
      const difficulty = difficultyMatch ? difficultyMatch[1] : 'O\'rta';

      // Extract question text
      const questionMatch = taskText.match(/Savol matni:\s*\n([\s\S]*?)(?=\n\s*(?:Rasm yuklash|Javob variantlari|To'g'ri javob|Tushuntirish))/);
      const questionText = questionMatch ? questionMatch[1].trim() : '';

      // Extract options (for multiple choice)
      const options = [];
      let correctAnswer = -1;
      const optionMatches = taskText.matchAll(/([A-D])\)\s*(.+?)(?=\n|$)/g);
      let index = 0;
      for (const match of optionMatches) {
        const fullText = match[2].trim();
        // Check if this option has a checkmark
        const hasCheckmark = fullText.includes('✓') || fullText.includes('✓') || fullText.includes('\\checkmark');

        // Remove checkmark from the option text
        const cleanText = fullText.replace(/\s*(✓|✓|\\checkmark)\s*$/, '').trim();

        options.push(cleanText);
        if (hasCheckmark) {
          correctAnswer = index;
        }
        index++;
      }

      // Extract explanation
      const explanationMatch = taskText.match(/Tushuntirish:\s*\n([\s\S]*?)(?=\n\s*Teglar:|\\end\{)/);
      const explanation = explanationMatch ? explanationMatch[1].trim() : '';

      // Extract tags
      const tagsMatch = taskText.match(/Teglar:\s*(.+?)(?=\n|$)/);
      const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [];

      const parsed = {
        taskType: taskType === 'SINGLE_CHOICE' ? 'SINGLE_CHOICE' : taskType,
        difficulty: difficulty === 'Oson' ? 'EASY' : difficulty === 'Qiyin' ? 'HARD' : 'MEDIUM',
        questionText,
        options,
        correctAnswer,
        explanation,
        tags
      };

      setParsedTask(parsed);
    } catch (err: any) {
      setError('Parsing xatosi: ' + err.message);
    }
  };

  const saveTask = async () => {
    if (!parsedTask) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // Get default topic (first mathematics topic for grade 4)
      const topicsResponse = await fetch('/api/topics?grade=4&subject=MATHEMATICS', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const topicsData = await topicsResponse.json();
      const defaultTopic = topicsData.data?.[0];

      if (!defaultTopic) {
        setError('Default mavzu topilmadi. Avval 4-sinf matematika mavzusini yarating.');
        setLoading(false);
        return;
      }

      // Prepare content based on task type
      const content: any = {
        task_type: parsedTask.taskType,
        question_text: parsedTask.questionText,
        metadata: {
          isAiGenerated: false,
          approved: false,
          source: 'manual_import'
        }
      };

      if (parsedTask.taskType === 'SINGLE_CHOICE') {
        content.options = parsedTask.options;
        content.correct_answer = parsedTask.correctAnswer;
        content.explanation = parsedTask.explanation;
      }

      const response = await fetch('/api/content/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contentTypeCode: 'TASK',
          topicId: defaultTopic.id,
          titleUz: parsedTask.questionText.substring(0, 100),
          content,
          difficulty: parsedTask.difficulty,
          tags: parsedTask.tags,
          status: 'PUBLISHED'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Topshiriq muvaffaqiyatli saqlandi!');
        setTaskText('');
        setParsedTask(null);
        setTimeout(() => {
          router.push('/admin/content/tasks');
        }, 2000);
      } else {
        setError('Xatolik: ' + (data.message || 'Topshiriq saqlanmadi'));
      }
    } catch (err: any) {
      setError('Server xatosi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Icon icon="solar:file-download-bold-duotone" className="text-blue-600" />
                  Topshiriqlarni import qilish
                </h1>
                <p className="text-gray-600 mt-1">LaTeX formatda topshiriqlarni qo'shish</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="solar:code-bold-duotone" className="text-blue-600" />
              Topshiriq matni (LaTeX format)
            </h2>

            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder={`\\begin{SINGLE_CHOICE}
\\text{Qiyinlik darajasi: O'rta}
\\text{Savol matni: }
\\text{Quyidagi sonlar to'plamidan } {12, 18, 28} \\text{ 4 ga bo'linadigan sonlarni tanlang.}

\\text{Javob variantlari:}
\\text{A) } 18, 42, 76
\\text{B) } 12, 28, 60 ✓
\\text{C) } 12, 28, 42
\\text{D) } 12, 60, 64

\\text{Tushuntirish: }
\\text{Sonning 4 ga bo'linishini aniqlash uchun ularni 4 ga bo'lishimiz kerak...}

\\text{Teglar: bo'luvchilar, karralilar}
\\end{SINGLE_CHOICE}`}
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={parseTask}
                disabled={!taskText.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Icon icon="solar:document-text-bold-duotone" className="text-xl" />
                Parse qilish
              </button>

              <Link
                href="/admin/content/tasks"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Icon icon="solar:close-circle-bold-duotone" className="text-xl" />
                Bekor qilish
              </Link>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="solar:eye-bold-duotone" className="text-green-600" />
              Ko'rinish (Preview)
            </h2>

            {!parsedTask && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <Icon icon="solar:file-search-bold-duotone" className="text-6xl mb-4" />
                <p>Topshiriqni parse qiling</p>
              </div>
            )}

            {parsedTask && (
              <div className="space-y-4">
                {/* Task Type */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Turi</div>
                  <div className="text-lg font-semibold text-blue-900">{parsedTask.taskType}</div>
                </div>

                {/* Difficulty */}
                <div className={`border rounded-lg p-4 ${
                  parsedTask.difficulty === 'EASY' ? 'bg-green-50 border-green-200' :
                  parsedTask.difficulty === 'HARD' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className={`text-sm font-medium ${
                    parsedTask.difficulty === 'EASY' ? 'text-green-600' :
                    parsedTask.difficulty === 'HARD' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>Qiyinlik</div>
                  <div className={`text-lg font-semibold ${
                    parsedTask.difficulty === 'EASY' ? 'text-green-900' :
                    parsedTask.difficulty === 'HARD' ? 'text-red-900' :
                    'text-yellow-900'
                  }`}>
                    {parsedTask.difficulty === 'EASY' ? 'Oson' :
                     parsedTask.difficulty === 'HARD' ? 'Qiyin' : "O'rtacha"}
                  </div>
                </div>

                {/* Question */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 font-medium mb-2">Savol</div>
                  <div className="text-gray-900 whitespace-pre-wrap">{parsedTask.questionText}</div>
                </div>

                {/* Options */}
                {parsedTask.options.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">Javob variantlari</div>
                    {parsedTask.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          index === parsedTask.correctAnswer
                            ? 'bg-green-50 border-green-500 border-2'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-gray-700">
                            {String.fromCharCode(65 + index)})
                          </span>
                          <span className="flex-1">{option}</span>
                          {index === parsedTask.correctAnswer && (
                            <Icon icon="solar:check-circle-bold" className="text-green-600 text-xl flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                {parsedTask.explanation && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium mb-2">Tushuntirish</div>
                    <div className="text-gray-900 text-sm whitespace-pre-wrap">{parsedTask.explanation}</div>
                  </div>
                )}

                {/* Tags */}
                {parsedTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {parsedTask.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={saveTask}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mt-6"
                >
                  {loading ? (
                    <>
                      <Icon icon="solar:refresh-bold-duotone" className="text-xl animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:check-circle-bold-duotone" className="text-xl" />
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <Icon icon="solar:danger-triangle-bold" className="text-2xl flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <Icon icon="solar:check-circle-bold" className="text-2xl flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>
    </div>
  );
}
