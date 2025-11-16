// Gemini AI integration for worksheet generation
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GenerateTasksParams {
  subject: string;
  grade: number;
  topic: string;
  taskCount: number;
  difficulty: string;
  taskTypes: string[];
}

export interface Task {
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  solution?: string;
}

const subjectLabels: Record<string, string> = {
  MATHEMATICS: 'Математика',
  PHYSICS: 'Физика',
  CHEMISTRY: 'Химия',
  BIOLOGY: 'Биология',
  RUSSIAN_LANGUAGE: 'Русский язык',
  UZBEK_LANGUAGE: 'Узбекский язык',
  ENGLISH_LANGUAGE: 'Английский язык',
  HISTORY: 'История',
  GEOGRAPHY: 'География',
  LITERATURE: 'Литература',
  INFORMATICS: 'Информатика',
};

const difficultyLabels: Record<string, string> = {
  EASY: 'легкий',
  MEDIUM: 'средний',
  HARD: 'сложный',
};

const taskTypeLabels: Record<string, string> = {
  TEST: 'тесты с выбором ответа',
  PROBLEM: 'задачи с решением',
  QUESTION: 'открытые вопросы',
  FILL_BLANK: 'задания на заполнение пропусков',
};

export async function generateTasks(params: GenerateTasksParams): Promise<Task[]> {
  // Проверяем наличие API ключа
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
    console.warn('GEMINI_API_KEY not set, using mock data');
    return generateMockTasks(params);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const subjectName = subjectLabels[params.subject] || params.subject;
  const difficultyName = difficultyLabels[params.difficulty] || params.difficulty;
  const taskTypesStr = params.taskTypes.map(t => taskTypeLabels[t] || t).join(', ');

  const prompt = `Ты опытный учитель ${subjectName} в Узбекистане.
Создай ${params.taskCount} учебных заданий для ${params.grade} класса по теме "${params.topic}".

Требования:
- Уровень сложности: ${difficultyName}
- Типы заданий: ${taskTypesStr}
- Задания должны быть на русском языке
- Задания должны соответствовать школьной программе Узбекистана
- Формат ответа: строгий JSON массив без дополнительного текста

Формат JSON для каждого задания:

Для тестов (TEST):
{
  "type": "TEST",
  "question": "Вопрос",
  "options": ["A) Вариант 1", "B) Вариант 2", "C) Вариант 3", "D) Вариант 4"],
  "correctAnswer": "A) Вариант 1"
}

Для задач (PROBLEM):
{
  "type": "PROBLEM",
  "question": "Условие задачи",
  "solution": "Подробное решение с объяснением",
  "correctAnswer": "Краткий ответ"
}

Для открытых вопросов (QUESTION):
{
  "type": "QUESTION",
  "question": "Вопрос",
  "correctAnswer": "Примерный ответ или ключевые моменты"
}

Для заполнения пропусков (FILL_BLANK):
{
  "type": "FILL_BLANK",
  "question": "Текст с пропуском (используй ___ для обозначения пропуска)",
  "correctAnswer": "Правильное слово/фраза"
}

Верни только JSON массив заданий, без markdown форматирования и дополнительных объяснений.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Очищаем текст от markdown форматирования
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');
    cleanText = cleanText.trim();

    // Парсим JSON
    const tasks = JSON.parse(cleanText);

    if (!Array.isArray(tasks)) {
      throw new Error('Response is not an array');
    }

    return tasks;
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error('Ошибка генерации заданий с помощью AI');
  }
}

// Mock генерация для тестирования без API ключа
function generateMockTasks(params: GenerateTasksParams): Task[] {
  const tasks: Task[] = [];
  const subjectName = subjectLabels[params.subject] || params.subject;

  for (let i = 0; i < params.taskCount; i++) {
    const taskType = params.taskTypes[i % params.taskTypes.length];

    switch (taskType) {
      case 'TEST':
        tasks.push({
          type: 'TEST',
          question: `Тестовый вопрос ${i + 1} по теме "${params.topic}" (${subjectName}, ${params.grade} класс)`,
          options: [
            'A) Вариант ответа 1',
            'B) Вариант ответа 2',
            'C) Вариант ответа 3',
            'D) Вариант ответа 4',
          ],
          correctAnswer: 'A) Вариант ответа 1',
        });
        break;

      case 'PROBLEM':
        tasks.push({
          type: 'PROBLEM',
          question: `Задача ${i + 1}: Решите задачу по теме "${params.topic}" для ${params.grade} класса.`,
          solution: `Подробное решение задачи ${i + 1}:\n1. Первый шаг...\n2. Второй шаг...\n3. Ответ: ...`,
          correctAnswer: 'Ответ задачи',
        });
        break;

      case 'QUESTION':
        tasks.push({
          type: 'QUESTION',
          question: `Вопрос ${i + 1}: Объясните ключевые концепции темы "${params.topic}".`,
          correctAnswer: 'Примерный ответ с ключевыми моментами.',
        });
        break;

      case 'FILL_BLANK':
        tasks.push({
          type: 'FILL_BLANK',
          question: `Заполните пропуск ${i + 1}: В теме "${params.topic}" важным понятием является ___.`,
          correctAnswer: 'ключевое слово',
        });
        break;
    }
  }

  return tasks;
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Скажи "OK"');
    const response = await result.response;
    return response.text().length > 0;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}
