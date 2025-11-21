'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Subject {
  id: string;
  code: string;
  nameUz: string;
}

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  subject: {
    code: string;
    nameUz: string;
  };
}

export default function ImportJSONPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  // Selection state
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  // Import state
  const [jsonText, setJsonText] = useState('');
  const [parsedTasks, setParsedTasks] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importErrors, setImportErrors] = useState<Array<{taskIndex: number, error: string, details?: any}>>([]);

  useEffect(() => {
    loadSubjectsAndTopics();
  }, []);

  const loadSubjectsAndTopics = async () => {
    try {
      const token = localStorage.getItem('token');

      // Load all subjects
      const subjectsResponse = await fetch('/api/subjects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjectsData = await subjectsResponse.json();
      if (subjectsData.success) {
        setSubjects(subjectsData.data);
      }

      // Load all topics
      const topicsResponse = await fetch('/api/topics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const topicsData = await topicsResponse.json();
      if (topicsData.success) {
        setAllTopics(topicsData.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  // Filter subjects based on selected grade (only subjects that have topics for this grade)
  const availableSubjects = selectedGrade
    ? subjects.filter(subject =>
        allTopics.some(topic => topic.gradeNumber === selectedGrade && topic.subject.code === subject.code)
      )
    : subjects;

  // Filter topics based on selected grade and subject
  const availableTopics = allTopics.filter(topic => {
    if (selectedGrade && topic.gradeNumber !== selectedGrade) return false;
    if (selectedSubject && topic.subject.code !== selectedSubject) return false;
    return true;
  });

  const parseJSON = () => {
    try {
      setError('');
      setParsedTasks([]);

      const parsed = JSON.parse(jsonText);

      // Check if it's an array or object with tasks property
      let tasksArray = Array.isArray(parsed) ? parsed : parsed.tasks;

      if (!tasksArray || !Array.isArray(tasksArray)) {
        setError('JSON должен содержать массив задач или объект с полем "tasks"');
        return;
      }

      // Validate each task
      const validatedTasks = tasksArray.map((task, index) => {
        if (!task.taskType) {
          throw new Error(`Задача ${index + 1}: отсутствует поле taskType`);
        }
        if (!task.questionText) {
          throw new Error(`Задача ${index + 1}: отсутствует поле questionText`);
        }
        return task;
      });

      setParsedTasks(validatedTasks);
      setSuccess(`Успешно распознано ${validatedTasks.length} задач(и)`);
    } catch (err: any) {
      setError('Ошибка парсинга JSON: ' + err.message);
      setParsedTasks([]);
    }
  };

  const importTasks = async () => {
    if (!selectedGrade || !selectedSubject || !selectedTopic) {
      setError('Пожалуйста, выберите класс, предмет и тему');
      return;
    }

    if (parsedTasks.length === 0) {
      setError('Нет задач для импорта. Сначала нажмите "Проверить JSON"');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setImportProgress({ current: 0, total: parsedTasks.length });
    setImportErrors([]);

    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let failCount = 0;
      const errors: Array<{taskIndex: number, error: string, details?: any}> = [];

      for (let i = 0; i < parsedTasks.length; i++) {
        const task = parsedTasks[i];
        setImportProgress({ current: i + 1, total: parsedTasks.length });

        try {
          // Prepare content based on task type
          const content: any = {
            task_type: task.taskType,
            question_text: task.questionText,
            metadata: {
              isAiGenerated: false,
              approved: false,
              source: 'json_import'
            }
          };

          // Add type-specific fields
          if (task.taskType === 'SINGLE_CHOICE') {
            content.options = task.options;
            content.correct_answer = task.correctAnswer;
            content.explanation = task.explanation;
          } else if (task.taskType === 'MULTIPLE_CHOICE') {
            content.options = task.options;
            content.correct_answers = task.correctAnswers;
            content.explanation = task.explanation;
          } else if (task.taskType === 'TRUE_FALSE') {
            content.correct_answer = task.correctAnswer;
            content.explanation = task.explanation;
          } else if (task.taskType === 'SHORT_ANSWER') {
            content.correct_answer = task.correctAnswer;
            content.acceptable_answers = task.acceptableAnswers || [task.correctAnswer];
            content.explanation = task.explanation;
          } else if (task.taskType === 'LONG_ANSWER') {
            content.sample_answer = task.sampleAnswer;
            content.rubric = task.rubric;
            content.explanation = task.explanation;
          } else if (task.taskType === 'FILL_BLANKS') {
            content.blanks = task.blanks;
            content.explanation = task.explanation;
          } else if (task.taskType === 'MATCHING') {
            content.left_column = task.leftColumn;
            content.right_column = task.rightColumn;
            content.correct_pairs = task.correctPairs;
            content.explanation = task.explanation;
          }

          // Add optional fields
          if (task.imageUrl) content.image_url = task.imageUrl;
          if (task.imagePrompt) content.image_prompt = task.imagePrompt;

          const requestBody = {
            typeCode: 'TASK',
            topicId: selectedTopic,
            titleUz: task.questionText.substring(0, 100),
            content,
            difficulty: task.difficulty || 'MEDIUM',
            tags: task.tags || [],
            status: 'PUBLISHED'
          };

          console.log(`Importing task ${i + 1}:`, requestBody);

          const response = await fetch('/api/content/items', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          const data = await response.json();
          console.log(`Task ${i + 1} response:`, data);

          if (data.success) {
            successCount++;
          } else {
            failCount++;
            errors.push({
              taskIndex: i + 1,
              error: data.message || 'Unknown error',
              details: data
            });
            console.error(`Failed to import task ${i + 1}:`, data);
          }
        } catch (err: any) {
          failCount++;
          errors.push({
            taskIndex: i + 1,
            error: err.message || 'Unknown error',
            details: err
          });
          console.error(`Error importing task ${i + 1}:`, err);
        }
      }

      setImportErrors(errors);
      setSuccess(`Импорт завершен! Успешно: ${successCount}, Ошибок: ${failCount}`);

      if (successCount > 0) {
        setTimeout(() => {
          router.push('/admin/content/tasks');
        }, 3000);
      }
    } catch (err: any) {
      setError('Ошибка импорта: ' + err.message);
    } finally {
      setLoading(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const selectedTopicInfo = availableTopics.find(t => t.id === selectedTopic);

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
                  <Icon icon="solar:database-bold-duotone" className="text-blue-600" />
                  JSON импорт задач
                </h1>
                <p className="text-gray-600 mt-1">Массовый импорт задач из JSON формата</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">1</span>
            Выберите класс, предмет и тему
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Класс
              </label>
              <select
                value={selectedGrade || ''}
                onChange={(e) => {
                  setSelectedGrade(e.target.value ? Number(e.target.value) : null);
                  setSelectedSubject('');
                  setSelectedTopic('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите класс</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(grade => (
                  <option key={grade} value={grade}>{grade}-sinf</option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Предмет
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic('');
                }}
                disabled={!selectedGrade}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Выберите предмет</option>
                {availableSubjects.map(subject => (
                  <option key={subject.id} value={subject.code}>{subject.nameUz}</option>
                ))}
              </select>
              {selectedGrade && availableSubjects.length === 0 && (
                <p className="text-sm text-red-600 mt-1">Нет предметов с темами для {selectedGrade}-класса</p>
              )}
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject || availableTopics.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Выберите тему</option>
                {availableTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.titleUz}</option>
                ))}
              </select>
              {selectedSubject && availableTopics.length === 0 && (
                <p className="text-sm text-red-600 mt-1">Нет тем для выбранного класса и предмета</p>
              )}
            </div>
          </div>

          {selectedTopicInfo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-900">
                <Icon icon="solar:check-circle-bold" className="text-xl" />
                <span className="font-medium">
                  Выбрано: {selectedTopicInfo.gradeNumber}-sinf → {selectedTopicInfo.subject.nameUz} → {selectedTopicInfo.titleUz}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: JSON Input */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">2</span>
            Вставьте JSON с задачами
          </h2>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder={`[
  {
    "taskType": "SINGLE_CHOICE",
    "difficulty": "MEDIUM",
    "questionText": "Ваш вопрос здесь",
    "options": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
    "correctAnswer": 1,
    "explanation": "Объяснение",
    "tags": ["тег1", "тег2"]
  }
]`}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={parseJSON}
              disabled={!jsonText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Icon icon="solar:code-scan-bold-duotone" className="text-xl" />
              Проверить JSON
            </button>

            <a
              href="#json-template"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Icon icon="solar:document-bold-duotone" className="text-xl" />
              Показать шаблоны
            </a>
          </div>

          {parsedTasks.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-900">
                <Icon icon="solar:check-circle-bold" className="text-xl" />
                <span className="font-medium">
                  Распознано {parsedTasks.length} задач(и). Готово к импорту!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2.5: Preview Tasks */}
        {parsedTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="solar:eye-bold-duotone" className="text-purple-600 text-2xl" />
              Предпросмотр задач ({parsedTasks.length})
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {parsedTasks.map((task, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {/* Task Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {task.taskType}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        task.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                        task.difficulty === 'HARD' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.difficulty === 'EASY' ? 'Oson' : task.difficulty === 'HARD' ? 'Qiyin' : "O'rtacha"}
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 font-medium mb-1">Savol:</div>
                    <div className="text-gray-900">{task.questionText}</div>
                  </div>

                  {/* Task Type Specific Content */}
                  {task.taskType === 'SINGLE_CHOICE' && task.options && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">Variantlar:</div>
                      <div className="space-y-1">
                        {task.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 px-3 py-2 rounded ${
                              optIndex === task.correctAnswer
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <span className="font-medium text-gray-700">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            <span className="flex-1">{option}</span>
                            {optIndex === task.correctAnswer && (
                              <Icon icon="solar:check-circle-bold" className="text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.taskType === 'MULTIPLE_CHOICE' && task.options && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">Variantlar:</div>
                      <div className="space-y-1">
                        {task.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2 px-3 py-2 rounded ${
                              task.correctAnswers?.includes(optIndex)
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <span className="font-medium text-gray-700">
                              {String.fromCharCode(65 + optIndex)})
                            </span>
                            <span className="flex-1">{option}</span>
                            {task.correctAnswers?.includes(optIndex) && (
                              <Icon icon="solar:check-circle-bold" className="text-green-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.taskType === 'TRUE_FALSE' && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">To'g'ri javob:</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded ${
                        task.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <Icon icon={task.correctAnswer ? "solar:check-circle-bold" : "solar:close-circle-bold"} />
                        <span className="font-medium">{task.correctAnswer ? "To'g'ri" : "Noto'g'ri"}</span>
                      </div>
                    </div>
                  )}

                  {task.taskType === 'SHORT_ANSWER' && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">To'g'ri javob:</div>
                      <div className="bg-green-100 text-green-900 px-3 py-2 rounded border border-green-300 inline-block">
                        {task.correctAnswer}
                      </div>
                    </div>
                  )}

                  {task.taskType === 'LONG_ANSWER' && task.sampleAnswer && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">Namuna javob:</div>
                      <div className="bg-blue-50 text-blue-900 px-3 py-2 rounded border border-blue-200 whitespace-pre-wrap text-sm">
                        {task.sampleAnswer}
                      </div>
                    </div>
                  )}

                  {task.taskType === 'FILL_BLANKS' && task.blanks && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">Bo'sh joylar:</div>
                      <div className="space-y-1">
                        {task.blanks.map((blank: any, blankIndex: number) => (
                          <div key={blankIndex} className="bg-white px-3 py-2 rounded border border-gray-200">
                            <span className="text-gray-600">Pozitsiya {blank.position}:</span>{' '}
                            <span className="font-medium text-green-700">{blank.correctAnswer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.taskType === 'MATCHING' && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">Moslashtirish:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Chap ustun:</div>
                          {task.leftColumn?.map((item: string, i: number) => (
                            <div key={i} className="bg-white px-2 py-1 rounded border border-gray-200 text-sm mb-1">
                              {i + 1}. {item}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">O'ng ustun:</div>
                          {task.rightColumn?.map((item: string, i: number) => (
                            <div key={i} className="bg-white px-2 py-1 rounded border border-gray-200 text-sm mb-1">
                              {String.fromCharCode(65 + i)}. {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {task.explanation && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 font-medium mb-1">Tushuntirish:</div>
                      <div className="bg-purple-50 text-purple-900 px-3 py-2 rounded border border-purple-200 text-sm">
                        {task.explanation}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Import */}
        {parsedTasks.length > 0 && selectedTopic && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">3</span>
              Импортировать задачи
            </h2>

            <button
              onClick={importTasks}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <Icon icon="solar:refresh-bold-duotone" className="text-xl animate-spin" />
                  Импорт... ({importProgress.current}/{importProgress.total})
                </>
              ) : (
                <>
                  <Icon icon="solar:download-minimalistic-bold-duotone" className="text-xl" />
                  Импортировать {parsedTasks.length} задач(и)
                </>
              )}
            </button>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <Icon icon="solar:danger-triangle-bold" className="text-2xl flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3 mb-6">
            <Icon icon="solar:check-circle-bold" className="text-2xl flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Detailed Import Errors */}
        {importErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" className="text-2xl" />
              Подробные ошибки импорта ({importErrors.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {importErrors.map((err, index) => (
                <div key={index} className="bg-white border border-red-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                      {err.taskIndex}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-red-900 mb-1">
                        Задача #{err.taskIndex}
                      </div>
                      <div className="text-sm text-red-700 mb-2">
                        {err.error}
                      </div>
                      {err.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                            Показать детали
                          </summary>
                          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto text-red-900">
                            {JSON.stringify(err.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                💡 <strong>Совет:</strong> Откройте консоль браузера (F12) для просмотра полных логов запросов и ответов API.
              </div>
            </div>
          </div>
        )}

        {/* JSON Templates Section */}
        <div id="json-template" className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Icon icon="solar:document-text-bold-duotone" className="text-blue-600 text-2xl" />
            Шаблоны JSON для 7 типов задач
          </h2>

          <p className="text-gray-600 mb-4">
            Скопируйте нужный шаблон, заполните своими данными и вставьте в поле выше.
            Можно импортировать сразу несколько задач - просто оберните их в массив [ ].
          </p>

          {/* Templates will be shown below */}
          <div className="space-y-4">
            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                1. SINGLE_CHOICE (Один правильный ответ)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "SINGLE_CHOICE",
  "difficulty": "MEDIUM",
  "questionText": "Quyidagi sonlardan qaysi biri 4 ga qoldiqsiz bo'linadi?",
  "options": [
    "15",
    "23",
    "28",
    "31"
  ],
  "correctAnswer": 2,
  "explanation": "28 soni 4 ga qoldiqsiz bo'linadi: 28 ÷ 4 = 7",
  "tags": ["bo'luvchilar", "natural sonlar"],
  "imageUrl": null,
  "imagePrompt": "Natural sonlar va bo'luvchilar diagrammasi"
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                2. MULTIPLE_CHOICE (Несколько правильных ответов)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "MULTIPLE_CHOICE",
  "difficulty": "HARD",
  "questionText": "Quyidagi sonlardan qaysilari tub sonlar hisoblanadi?",
  "options": [
    "2",
    "4",
    "7",
    "9",
    "11"
  ],
  "correctAnswers": [0, 2, 4],
  "explanation": "Tub sonlar faqat 1 va o'ziga qoldiqsiz bo'linadigan sonlar. 2, 7 va 11 tub sonlardir.",
  "tags": ["tub sonlar", "bo'luvchilar"]
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                3. TRUE_FALSE (Верно/Неверно)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "TRUE_FALSE",
  "difficulty": "EASY",
  "questionText": "100 soni 25 ga qoldiqsiz bo'linadi.",
  "correctAnswer": true,
  "explanation": "100 ÷ 25 = 4. Demak, bu tasdiq to'g'ri.",
  "tags": ["bo'linish", "natural sonlar"]
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                4. SHORT_ANSWER (Короткий ответ)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "SHORT_ANSWER",
  "difficulty": "MEDIUM",
  "questionText": "125 + 378 = ?",
  "correctAnswer": "503",
  "acceptableAnswers": ["503", "503.0", "503,0"],
  "explanation": "125 + 378 = 503",
  "tags": ["qo'shish", "arifmetika"]
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                5. LONG_ANSWER (Развернутый ответ с критериями)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "LONG_ANSWER",
  "difficulty": "HARD",
  "questionText": "Dukonda 240 ta olma bor edi. Birinchi kuni 65 ta, ikkinchi kuni 48 ta olma sotildi. Dukonda nechta olma qoldi? Yechimni batafsil yozing.",
  "sampleAnswer": "1) Birinchi va ikkinchi kunda jami sotilgan olmalar:\\n65 + 48 = 113 ta\\n\\n2) Qolgan olmalar:\\n240 - 113 = 127 ta\\n\\nJavob: 127 ta olma qoldi.",
  "rubric": {
    "totalPoints": 5,
    "criteria": [
      {
        "point": 2,
        "description": "To'g'ri formula va yechim usuli"
      },
      {
        "point": 2,
        "description": "To'g'ri hisoblash"
      },
      {
        "point": 1,
        "description": "Aniq javob bilan yakunlash"
      }
    ]
  },
  "explanation": "Masalani yechish uchun avval sotilgan barcha olmalarni qo'shamiz, keyin umumiy sondan ayiramiz.",
  "tags": ["masala", "qo'shish", "ayirish"]
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                6. FILL_BLANKS (Заполнить пропуски)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "FILL_BLANKS",
  "difficulty": "MEDIUM",
  "questionText": "7 × ___ = 56 va ___ × 6 = 48",
  "blanks": [
    {
      "position": 1,
      "correctAnswer": "8",
      "acceptableAnswers": ["8", "8.0"]
    },
    {
      "position": 2,
      "correctAnswer": "8",
      "acceptableAnswers": ["8", "8.0"]
    }
  ],
  "explanation": "7 × 8 = 56 va 8 × 6 = 48",
  "tags": ["ko'paytirish", "jadval"]
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                7. MATCHING (Сопоставление)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "taskType": "MATCHING",
  "difficulty": "MEDIUM",
  "questionText": "Shakllarni ularning xususiyatlari bilan moslashtiring.",
  "leftColumn": [
    "Kvadrat",
    "To'rtburchak",
    "Uchburchak",
    "Doira"
  ],
  "rightColumn": [
    "4 ta teng tomoni bor",
    "3 ta uchi bor",
    "Aylanma shakl",
    "Qarama-qarshi tomonlari parallel"
  ],
  "correctPairs": [
    { "left": 0, "right": 0 },
    { "left": 1, "right": 3 },
    { "left": 2, "right": 1 },
    { "left": 3, "right": 2 }
  ],
  "explanation": "Kvadrat - 4 ta teng tomoni bor, To'rtburchak - qarama-qarshi tomonlari parallel, Uchburchak - 3 ta uchi bor, Doira - aylanma shakl.",
  "tags": ["geometriya", "shakllar"]
}`}
                </pre>
              </div>
            </details>

            <details className="border border-gray-200 rounded-lg">
              <summary className="px-4 py-3 bg-gray-50 cursor-pointer font-medium text-gray-900 hover:bg-gray-100">
                📦 МАССОВЫЙ ИМПОРТ (несколько задач сразу)
              </summary>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`[
  {
    "taskType": "SINGLE_CHOICE",
    "difficulty": "EASY",
    "questionText": "5 + 3 = ?",
    "options": ["6", "7", "8", "9"],
    "correctAnswer": 2,
    "explanation": "5 + 3 = 8",
    "tags": ["qo'shish"]
  },
  {
    "taskType": "TRUE_FALSE",
    "difficulty": "EASY",
    "questionText": "10 > 5",
    "correctAnswer": true,
    "explanation": "10 soni 5 dan katta",
    "tags": ["taqqoslash"]
  },
  {
    "taskType": "SHORT_ANSWER",
    "difficulty": "MEDIUM",
    "questionText": "12 × 3 = ?",
    "correctAnswer": "36",
    "acceptableAnswers": ["36", "36.0"],
    "explanation": "12 × 3 = 36",
    "tags": ["ko'paytirish"]
  }
]`}
                </pre>
              </div>
            </details>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Общие поля для всех типов:</h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-5 list-disc">
              <li><code className="bg-blue-100 px-1 rounded">taskType</code> - тип задачи (обязательно)</li>
              <li><code className="bg-blue-100 px-1 rounded">difficulty</code> - уровень: EASY, MEDIUM, HARD (по умолчанию MEDIUM)</li>
              <li><code className="bg-blue-100 px-1 rounded">questionText</code> - текст вопроса (обязательно)</li>
              <li><code className="bg-blue-100 px-1 rounded">explanation</code> - объяснение решения (опционально)</li>
              <li><code className="bg-blue-100 px-1 rounded">tags</code> - массив тегов (опционально)</li>
              <li><code className="bg-blue-100 px-1 rounded">imageUrl</code> - ссылка на изображение (опционально)</li>
              <li><code className="bg-blue-100 px-1 rounded">imagePrompt</code> - промпт для генерации изображения (опционально)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
