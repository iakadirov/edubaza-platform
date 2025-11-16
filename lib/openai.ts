// OpenAI integration for worksheet generation
import OpenAI from 'openai';
import { TaskType, Difficulty } from '@prisma/client';
import { getRandomPredefinedTasks } from './db-predefined-tasks';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GenerateTasksParams {
  subject: string;
  grade: number;
  topic: string;
  taskCount: number;
  difficulty: string;
  taskTypes: string[];
  language?: string; // 'ru', 'uz-latn', 'uz-cyrl'
}

export interface Task {
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  solution?: string;
}

const subjectLabels: Record<string, string> = {
  MATHEMATICS: 'Matematika',
  PHYSICS: 'Fizika',
  CHEMISTRY: 'Kimyo',
  BIOLOGY: 'Biologiya',
  RUSSIAN_LANGUAGE: 'Rus tili',
  UZBEK_LANGUAGE: 'Oʻzbek tili',
  ENGLISH_LANGUAGE: 'Ingliz tili',
  HISTORY: 'Tarix',
  GEOGRAPHY: 'Geografiya',
  LITERATURE: 'Adabiyot',
  INFORMATICS: 'Informatika',
};

const difficultyLabels: Record<string, string> = {
  EASY: 'oson',
  MEDIUM: 'oʻrta',
  HARD: 'qiyin',
};

const taskTypeLabels: Record<string, string> = {
  TEST: 'testlar',
  PROBLEM: 'masalalar',
  QUESTION: 'ochiq savollar',
  FILL_BLANK: 'boʻsh joyni toʻldirish',
};

// Генерация задач из БД (100% готовые задачи)
export async function generateTasksFromDatabase(params: GenerateTasksParams): Promise<Task[]> {
  try {
    // Конвертируем строковые параметры в enum типы
    const taskTypes = params.taskTypes.map(t => t as TaskType);
    const difficulty = params.difficulty as Difficulty;

    // Получаем случайные задачи из БД
    const predefinedTasks = await getRandomPredefinedTasks(
      params.subject,
      params.grade,
      taskTypes,
      difficulty,
      params.taskCount
    );

    // Конвертируем задачи из БД в формат Task
    const tasks: Task[] = predefinedTasks.map(task => {
      const baseTask = {
        type: task.taskType,
        question: task.question,
      };

      // Добавляем специфичные поля в зависимости от типа
      switch (task.taskType) {
        case 'TEST':
          return {
            ...baseTask,
            options: (task.content as any).options || [],
            correctAnswer: (task.content as any).correctAnswer || '',
          };

        case 'PROBLEM':
          return {
            ...baseTask,
            solution: (task.content as any).solution || '',
            correctAnswer: (task.content as any).answer || '',
          };

        case 'QUESTION':
          return {
            ...baseTask,
            correctAnswer: (task.content as any).sampleAnswer || '',
          };

        case 'FILL_BLANK':
          return {
            ...baseTask,
            correctAnswer: (task.content as any).answers?.[0] || '',
          };

        default:
          return baseTask;
      }
    });

    // Если недостаточно задач в БД, дополняем mock данными
    if (tasks.length < params.taskCount) {
      console.warn(`Only ${tasks.length} tasks found in DB, need ${params.taskCount}. Filling with mock data.`);
      const mockTasks = generateMockTasks({
        ...params,
        taskCount: params.taskCount - tasks.length,
      });
      return [...tasks, ...mockTasks];
    }

    return tasks;
  } catch (error) {
    console.error('Database task generation error:', error);
    // Fallback на mock данные
    console.warn('Falling back to mock data');
    return generateMockTasks(params);
  }
}

export async function generateTasks(params: GenerateTasksParams): Promise<Task[]> {
  // ПРИОРИТЕТ 1: Пробуем взять задачи из БД (100%)
  try {
    const dbTasks = await generateTasksFromDatabase(params);
    if (dbTasks && dbTasks.length > 0) {
      console.log(`Generated ${dbTasks.length} tasks from database`);
      return dbTasks;
    }
  } catch (error) {
    console.error('Failed to generate from database:', error);
  }

  // ПРИОРИТЕТ 2: Если в БД нет задач, проверяем API ключ OpenAI
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
    console.warn('OPENAI_API_KEY not set, using mock data');
    return generateMockTasks(params);
  }

  const subjectName = subjectLabels[params.subject] || params.subject;
  const difficultyName = difficultyLabels[params.difficulty] || params.difficulty;
  const taskTypesStr = params.taskTypes.map(t => taskTypeLabels[t] || t).join(', ');

  // Системный промпт на узбекском
  const systemPrompt = `Siz ${params.grade}-sinf oʻquvchilari uchun ${subjectName} fanidan topshiriqlar yaratuvchi tajribali pedagog, metodist va fanga chuqur ega boʻlgan mutaxassisiz.

Sizning vazifangiz - Oʻzbekiston davlat ta'lim standartlari va milliy oʻquv dasturiga muvofiq, pedagogik jihatdan toʻgʻri va yoshga mos ta'lim materiallarini yaratish.

Siz har doim faqat toʻgʻri JSON formatida javob berasiz, hech qanday qoʻshimcha matn yoki markdown formatlashsiz.`;

  // Асосий промпт на узбекском
  const userPrompt = `"${params.topic}" mavzusi boʻyicha ${params.taskCount} ta topshiriq tuzing.

TALABLAR:
- Qiyinlik darajasi: ${difficultyName}
- Topshiriq turlari: ${taskTypesStr}
- Oʻzbekiston milliy ta'lim standartlariga toʻliq mos kelishi shart
- Topshiriqlar oʻquvchilarning yoshiga mos va pedagogik jihatdan toʻgʻri boʻlishi kerak
- Oʻzbek oʻquvchilariga tushunarli va yaqin boʻlgan real hayotiy misollardan foydalaning
- Qiyinlik darajasi doirasida turli xil murakkablikdagi savollar boʻlishi kerak
- FAQAT toʻgʻri JSON array qaytaring, boshqa matn yoki markdown yoʻq

HAR BIR TOPSHIRIQ UCHUN JSON FORMAT:

Test topshiriqlari uchun (TEST):
{
  "type": "TEST",
  "question": "Aniq va tushunarli savol, kerakli kontekst bilan",
  "options": ["A) 1-variant", "B) 2-variant", "C) 3-variant", "D) 4-variant"],
  "correctAnswer": "A) 1-variant"
}
MUHIM: Barcha variantlar ishonchli boʻlishi, aniq notoʻgʻri javoblardan qoching.

Masala topshiriqlari uchun (PROBLEM):
{
  "type": "PROBLEM",
  "question": "Batafsil masala sharti, barcha kerakli ma'lumotlar bilan",
  "solution": "Har bir qadam uchun tushuntirish bilan qadam-baqadam yechim",
  "correctAnswer": "Yakuniy javob, zarur boʻlsa oʻlchov birliklari bilan"
}
MUHIM: Yechim ta'limiy boʻlishi, fikrlash jarayonini koʻrsatishi kerak.

Ochiq savollar uchun (QUESTION):
{
  "type": "QUESTION",
  "question": "Tushuntirish yoki tahlil talab qiluvchi fikrlashga undovchi savol",
  "correctAnswer": "Kiritilishi kerak boʻlgan asosiy fikrlar bilan namuna javob"
}
MUHIM: Savollar tanqidiy fikrlashni ragʻbatlantirishi kerak.

Boʻsh joyni toʻldirish uchun (FILL_BLANK):
{
  "type": "FILL_BLANK",
  "question": "Boʻsh joyni ___ bilan belgilab yozilgan gap yoki xatboshi",
  "correctAnswer": "Boʻsh joyni toʻldiradigan soʻz yoki ibora"
}
MUHIM: Kontekst javobni aniq qilishi kerak, lekin tushunishni talab qilishi lozim.

SIFAT TALABLARI:
- Savol matnlari aniq va qisqa boʻlsin
- Vaziyat tasvirida ortiqcha soʻzlar boʻlmasin
- Real hayotiy misollar ishlatilsin (Oʻzbekiston sharoitiga mos)
- Ilmiy atamalar toʻgʻri va aniq qoʻllanilsin
- Javoblar toʻliq va aniq boʻlsin
- Yechimlar bosqichma-bosqich, tushuntirishlar bilan berilsin

FAQAT JSON array qaytaring, hech qanday markdown yoki qoʻshimcha matn yoʻq!`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.8, // Slightly higher for more creative tasks
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content || '{}';

    // Пытаемся распарсить ответ
    let parsed = JSON.parse(responseText);

    // Если ответ обёрнут в объект с ключом, извлекаем массив
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      return parsed.tasks;
    } else if (Array.isArray(parsed)) {
      return parsed;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('OpenAI generation error:', error);
    // Fallback на mock данные
    console.warn('Falling back to mock data');
    return generateMockTasks(params);
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

export async function testOpenAIConnection(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) return false;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say OK' }],
      max_tokens: 10,
    });

    return completion.choices[0].message.content ? true : false;
  } catch (error) {
    console.error('OpenAI connection test failed:', error);
    return false;
  }
}
