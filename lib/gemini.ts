/**
 * Gemini AI Service for Educational Content Generation
 * Uses Google Gemini 2.5 Flash for worksheet and problem generation
 */
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// System instruction template - will be populated with subject-specific meta-prompts
const SYSTEM_INSTRUCTION_TEMPLATE = `Siz Oʻzbekiston Xalq taʼlim vazirligining metodik mutaxassisi (metodist) sifatida ishlamoqdasiz.

ROLNING ASOSIY VAZIFALARI:
- Oʻzbekiston maktab dasturiga mos keladigan sifatli taʼlim materiallari yaratish
- Oʻzbek tilida (lotin yozuvida) aniq va tushunarli savollar tuzish
- Har bir topshiriq oʻquv dasturi standartlariga mos kelishi kerak
- Topshiriqlar oʻquvchilarning yosh xususiyatlariga moslashtrilgan boʻlishi kerak

FIKRLASH ALGORITMI (Mental Chain):
Har bir topshiriqni yaratishda quyidagi tartibni bajaring:
1. Avval oʻquvchining yoshini va sinf darajasini hisobga oling
2. Mavzuga mos real hayot kontekstini tanlang (Oʻzbekiston konteksti)
3. Sonlar va matnlarni oʻsha yosh uchun tushunarli darajada tanlang (hisoblash qiyin boʻlmasin)
4. Pedagogik jihatdan toʻgʻri va ilmiy jihatdan aniq boʻlishini tekshiring

MUHIM QOIDALAR:
- Oʻlchov birliklari: metr, kilometr, kilogramm, litr
- Oʻzbek tilida Oʻ va Gʻ harflari uchun ʻ (modifier letter U+02BB) ishlatish`;

// ============================================================================
// PROMPT REGISTRY: Modular Prompt Assembly System
// ============================================================================

// SUBJECT RULES: Предметная специфика
const SUBJECT_PROMPTS: Record<string, string> = {
  MATHEMATICS: `
--- FAN QOIDALARI: MATEMATIKA ---
Rol: Matematika oʻqituvchisi.
Maxsus talablar:
- Barcha formulalar uchun LaTeX formatidan foydalaning (masalan, $x^2 + y^2$)
- Faqat metrik sistema (SI) ishlatiladi
- Barcha sonlar mantiqiy boʻlishi kerak (manfiy uzunlik yoʻq)
- Geometriya uchun: Shaklning matnli tavsifini bering
- Hisoblashlar aniq boʻlishi kerak
- Javoblar oʻnli kasrda 2 xonagacha
`,

  PHYSICS: `
--- FAN QOIDALARI: FIZIKA ---
Rol: Fizika oʻqituvchisi.
Maxsus talablar:
- Formulalar LaTeX formatida: $F = ma$
- SI birliklari: metr, kilogramm, sekund, nyuton
- Real hayotdan misollar: mashina, poyezd, samolyot
- Jismlar: Oʻzbekistonda tanish predmetlar
- Grafiklar: Matnli tavsif bering
`,

  CHEMISTRY: `
--- FAN QOIDALARI: KIMYO ---
Rol: Kimyo oʻqituvchisi.
Maxsus talablar:
- Kimyoviy formulalar: H₂O, NaCl, CO₂
- Reaksiya tenglamalari muvozanatlashtirilgan boʻlishi kerak
- Xavfsizlik qoidalariga rioya qiling
- Amaliy misollar: kundalik hayotdan (tuz, shakar, suv)
`,

  BIOLOGY: `
--- FAN QOIDALARI: BIOLOGIYA ---
Rol: Biologiya oʻqituvchisi.
Maxsus talablar:
- Ilmiy nomlar lotin tilida, tushuntirish oʻzbek tilida
- Oʻzbekistonda uchraydigan oʻsimlik va hayvonlar
- Insonning anatomiyasi va fiziologiyasi
- Ekologiya: Aral dengizi, choʻllanish muammolari
`,

  RUSSIAN_LANGUAGE: `
--- FAN QOIDALARI: RUS TILI ---
Rol: Rus tili oʻqituvchisi.
Maxsus talablar:
- Grammatika: Aniq terminologiya
- Matnlar: Rus adabiyotidan parchalashlar
- Imlo va tinish belgilari qoidalari
- Soʻz boyligi: Sinonimlar, antonimlar
`,

  UZBEK_LANGUAGE: `
--- FAN QOIDALARI: OʻZBEK TILI ---
Rol: Oʻzbek tili oʻqituvchisi.
Maxsus talablar:
- Lotin alifbosi (Oʻ, Gʻ harflari uchun ʻ modifier)
- Imlo qoidalari: Xoʻjalik, oʻqituvchi, toʻgʻri
- Oʻzbek adabiyotidan misollar
- Milliy qadriyatlarni aks ettirish
`,

  ENGLISH_LANGUAGE: `
--- FAN QOIDALARI: INGLIZ TILI ---
Rol: ESL Teacher (CEFR Standards).
Maxsus talablar:
- CEFR darajasiga rioya qiling (A1-C2)
- Lug'at: Sinf darajasiga mos
- Grammatika: Mavzuga mos (Past Simple, Present Perfect)
- Slengsiz rasmiy til (agar mavzu "Norasmiy muloqot" bo'lmasa)
`,

  HISTORY: `
--- FAN QOIDALARI: TARIX ---
Rol: Tarix oʻqituvchisi.
Maxsus talablar:
- Sanalar va voqealar aniq boʻlishi kerak
- Oʻzbekiston tarixi: Amir Temur, Ulugʻbek davri
- Jahon tarixi: Oʻzbekiston bilan bogʻliq qismi
- Manbalarni korsating (tarixiy hujjatlar)
`,

  GEOGRAPHY: `
--- FAN QOIDALARI: GEOGRAFIYA ---
Rol: Geografiya oʻqituvchisi.
Maxsus talablar:
- Oʻzbekiston geografiyasi: viloyatlar, shaharlar, daryolar
- Mintaqaviy geografiya: Markaziy Osiyo
- Koordinatalar: Kenglik va uzunlik
- Tabiiy resurslar: paxta, gaz, oltin
`,

  LITERATURE: `
--- FAN QOIDALARI: ADABIYOT ---
Rol: Adabiyot tanqidchisi va oʻqituvchisi.
Maxsus talablar:
- Asarlarning mavzu va gʻoya tahlili
- Personajlar xarakteri va rivojlanishi
- Oʻzbek adabiyoti: Jadidchilik, klassiklik, folklor
- Iqtiboslar asardan keltirilishi kerak
`,

  INFORMATICS: `
--- FAN QOIDALARI: INFORMATIKA ---
Rol: Informatika oʻqituvchisi.
Maxsus talablar:
- Dasturlash: Python, Scratch (sinf darajasiga qarab)
- Algoritmlar: Pseudokod yoki blok-sxema
- Kompyuter savodxonligi: Internet xavfsizligi
- Amaliy vazifalar: Kod yozish, xatoliklarni tuzatish
`,
};

// FORMAT RULES: Стиль и формат задания
const FORMAT_PROMPTS: Record<string, string> = {
  DTS: `
--- FORMAT: DAVLAT TEST SINOVI (DTS/DTM) ---
Uslub: Davlat standarti (Oʻzbekiston Respublikasi).
Struktura:
- Savol qisqa va faktga asoslangan boʻlishi kerak
- 4 ta variant (A, B, C, D)
- Faqat BITTA toʻgʻri javob
- Notoʻgʻri javoblar: Umumiy hisoblash xatolari
- Noaniqlik yoʻq, aniq javob
`,

  PISA: `
--- FORMAT: PISA (Xalqaro baholash dasturi) ---
Uslub: PISA - Funktsional savodxonlik.
Struktura:
- "Stimulus Material" bilan boshlang: Qisqa real hayot hikoyasi, jadval yoki stsenariy (100-150 soʻz)
- Savol: Bilimni amaliy muammoni hal qilish uchun QOʻLLASH kerak
- Fokus: Matematik savodxonlik / Ilmiy savodxonlik
- Abstrak tenglamalardan qoching
- Misollar: Uyni taʼmirlash, kredit foizi, Toshkent-Samarqand poyezd tezligi
`,

  OLYMPIAD: `
--- FORMAT: OLIMPIADA (Yuqori murakkablik) ---
Uslub: Fan olimpiadasi.
Struktura:
- Qiyinlik: Yuqori / Juda yuqori
- Koʻp bosqichli mantiqiy fikrlash talab qilinadi
- "Hiyla" elementlar yoki yashirin shartlar
- Yechim: Ijodiy yondashuv yoki isbot
- Standart formulalar yetarli emas
`,

  REAL_LIFE: `
--- FORMAT: REAL HAYOT (STEAM / Loyihaga asoslangan) ---
Uslub: Amaliy qoʻllash / Haqiqiy hayot.
Struktura:
- Kontekst: Oʻzbek talabaga tanish vaziyatlar (paxta yetishtirish, quyosh panellari, Toshkent metrosi, 100 kishilik osh)
- Fanlararo: Matematika + iqtisod yoki fizika
- Maqsad: Bu bilim kundalik hayotda nima uchun foydali ekanligini koʻrsating
`,

  STANDARD: `
--- FORMAT: STANDART MAKTAB MASHQI ---
Uslub: Oddiy maktab darslik mashqi.
Struktura:
- Mavzuni mustahkamlash uchun oddiy mashq
- Progressiv qiyinlik: Oson → Oʻrta → Qiyin
- Aniq koʻrsatmalar
- Talabaga tushunarliroq
`,
};

export interface GenerateTasksParams {
  subject: string;
  grade: number;
  topic: string;
  taskCount: number;
  difficulty: string;
  taskTypes: string[];
  format?: 'DTS' | 'PISA' | 'OLYMPIAD' | 'REAL_LIFE' | 'STANDARD'; // Формат задания
  customInstructions?: string; // Дополнительные инструкции
}

export interface GenerateTasksResult {
  tasks: Task[];
  debugInfo?: {
    params: GenerateTasksParams;
    systemInstruction: string;
    userPrompt: string;
    rawResponse: string;
    parseError?: string;
    timestamp: string;
  };
}

// All supported task types
export type TaskType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'FILL_BLANK'
  | 'MATCHING'
  | 'PROBLEM_SOLVING';

export interface Task {
  type: TaskType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  solution?: string;
  pairs?: Array<{ left: string; right: string }>;
  metadata?: {
    isAiGenerated?: boolean;
    generatedAt?: string;
    approved?: boolean;
  };
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
  SINGLE_CHOICE: 'bir javobli test',
  MULTIPLE_CHOICE: 'koʻp javobli test',
  TRUE_FALSE: 'toʻgʻri/notoʻgʻri',
  SHORT_ANSWER: 'qisqa javob',
  FILL_BLANK: 'boʻsh joyni toʻldirish',
  MATCHING: 'moslashtirish',
  PROBLEM_SOLVING: 'masala yechish',
};

/**
 * Modular Prompt Assembly: LEGO System
 * Собирает финальный промпт из модулей
 */
function buildPrompt(params: GenerateTasksParams): { systemInstruction: string; userPrompt: string } {
  const { subject, grade, topic, taskCount, difficulty, format = 'STANDARD', customInstructions } = params;

  // 1. Base System Instruction (роль методиста)
  let systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE;

  // 2. Add Subject Rules
  const subjectPrompt = SUBJECT_PROMPTS[subject] || '';
  if (subjectPrompt) {
    systemInstruction += '\n\n' + subjectPrompt;
  }

  // 3. Add Format Rules
  const formatPrompt = FORMAT_PROMPTS[format] || FORMAT_PROMPTS.STANDARD;
  systemInstruction += '\n\n' + formatPrompt;

  // 4. Build User Prompt (конкретная задача)
  const subjectName = subjectLabels[subject] || subject;
  const difficultyName = difficultyLabels[difficulty] || difficulty;
  const taskTypesStr = params.taskTypes.map(t => taskTypeLabels[t] || t).join(', ');

  let userPrompt = `*** KONTEKST ***
Sinf: ${grade}-sinf
Fan: ${subjectName}
Mavzu: "${topic}"
Til: Oʻzbek tili (lotin yozuvi, ʻ modifier U+02BB Oʻ va Gʻ uchun)
Format: ${format}

Oʻzbekiston konteksti:
- Nomlar: Anvar, Malika, Aziz, Nodira, Jahongir, Dildora, Sardor, Nilufar, Zebo
- Shaharlar: Toshkent, Samarqand, Buxoro, Xiva, Andijon, Fargʻona, Namangan
- Valyuta: Soʻm

*** VAZIFA ***
${taskCount} ta mashq yarating.

*** MASHQ YARATISH QOIDALARI ***
- Mashq turlari: ${taskTypesStr}
- Qiyinlik darajasi: ${difficultyName}
- Har bir mashq turi uchun faqat kerakli maydonlarni qoʻshing:
  • SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE: options va correctAnswer
  • SHORT_ANSWER: faqat correctAnswer
  • FILL_BLANKS: question (matn ___ bilan) va correctAnswer
  • MATCHING: pairs va correctAnswer
  • LONG_ANSWER: question, solution va correctAnswer
- "options" maydonida harflarni (A), B), C), D)) qoʻshMANG - ular avtomatik qoʻshiladi
- Barcha mashq turlarida "correctAnswer" MAJBURIY

*** KONTENT QOIDALARI ***
- Har bir mashqni yaratishda avval oʻquvchining yoshini (${grade}-sinf) hisobga oling
- Matn va sonlarni oʻsha yosh uchun tushunarli qiling
- Pedagogik jihatdan toʻgʻri va ilmiy jihatdan aniq boʻlishi kerak`;

  // Append custom instructions if provided
  if (customInstructions && customInstructions.trim()) {
    userPrompt += `\n\nQOʻSHIMCHA TALABLAR:\n${customInstructions}`;
  }

  return { systemInstruction, userPrompt };
}

// JSON Schema for task validation - STRICT SCHEMA ENFORCEMENT
const TASK_JSON_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_BLANKS', 'MATCHING', 'LONG_ANSWER'],
        description: 'Task type - determines which fields are required'
      },
      question: {
        type: 'string',
        description: 'The question or problem statement'
      },
      options: {
        type: 'array',
        items: { type: 'string' },
        description: 'Answer options for SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE. Not needed for other types.'
      },
      correctAnswer: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } }
        ],
        description: 'The correct answer(s). REQUIRED for all task types.'
      },
      solution: {
        type: 'string',
        description: 'Detailed step-by-step solution. ONLY for PROBLEM_SOLVING type.'
      },
      pairs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            left: { type: 'string' },
            right: { type: 'string' }
          },
          required: ['left', 'right']
        },
        description: 'Matching pairs. ONLY for MATCHING type.'
      }
    },
    required: ['type', 'question', 'correctAnswer']
  }
};

export async function generateTasks(params: GenerateTasksParams): Promise<GenerateTasksResult> {
  // Check if API key is configured
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === '') {
    console.warn('GEMINI_API_KEY not set, using mock data');
    return { tasks: generateMockTasks(params) };
  }

  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // ============================================================================
  // MODULAR PROMPT ASSEMBLY: Build prompt using LEGO system
  // ============================================================================
  const { systemInstruction, userPrompt } = buildPrompt(params);

  let rawResponse = '';
  let parseError: string | undefined = undefined;

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧩 GEMINI AI GENERATION - DETAILED LOGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Input Parameters:');
  console.log(`  Subject: ${params.subject}`);
  console.log(`  Format: ${params.format || 'STANDARD'}`);
  console.log(`  Grade: ${params.grade}`);
  console.log(`  Topic: ${params.topic}`);
  console.log(`  Task Count: ${params.taskCount}`);
  console.log(`  Difficulty: ${params.difficulty}`);
  console.log(`  Task Types: ${params.taskTypes.join(', ')}`);
  console.log('');
  console.log('📝 Prompt Sizes:');
  console.log(`  System Instruction: ${systemInstruction.length} characters`);
  console.log(`  User Prompt: ${userPrompt.length} characters`);
  console.log('');
  console.log('💬 System Instruction (first 500 chars):');
  console.log(systemInstruction.substring(0, 500));
  console.log('  ...');
  console.log('');
  console.log('💬 User Prompt (first 500 chars):');
  console.log(userPrompt.substring(0, 500));
  console.log('  ...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    console.log('📤 Sending request to Gemini...');
    console.log(`   Model: ${modelName}`);
    console.log(`   Temperature: 0.2`);
    console.log(`   Max Output Tokens: 8192`);
    console.log('');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: userPrompt }]
      },
      systemInstruction: systemInstruction + '\n\nMUHIM: JSON formatida javob berganingizda, barcha satrlar ichidagi qo\'shtirnoqlarni to\'g\'ri escape qiling. JSON yaroqli bo\'lishi kerak.',
      config: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: TASK_JSON_SCHEMA,
      },
    });

    console.log('✅ Response received from Gemini');
    console.log('');

    if (!response || !response.text) {
      console.error('❌ Empty response from Gemini');
      console.error('   Response object:', response);
      throw new Error('AI dan javob olinmadi');
    }

    const text = response.text;
    rawResponse = text; // Save for debug info
    console.log('📦 Raw Response Length:', text.length, 'characters');
    console.log('📦 Raw Response Preview (first 500 chars):');
    console.log(text.substring(0, 500));
    console.log('  ...');
    console.log('');

    // Parse JSON (already in JSON format due to responseMimeType)
    console.log('🔄 Parsing JSON response...');

    let tasks;
    try {
      tasks = JSON.parse(text);
      console.log('✅ JSON parsed successfully');
      console.log('');
    } catch (jsonParseError: any) {
      parseError = jsonParseError.message; // Save for debug info
      console.error('❌ Initial JSON parse failed');
      console.error('   Error:', jsonParseError.message);
      console.log('');
      console.log('🔧 Attempting to repair JSON...');

      // Try to fix common JSON issues
      let fixedText = text;

      // Fix unterminated strings by ensuring proper quote escaping
      // This is a simple attempt - may not work for all cases
      try {
        // Log the problematic area
        const errorMatch = jsonParseError.message.match(/position (\d+)/);
        if (errorMatch) {
          const position = parseInt(errorMatch[1]);
          const start = Math.max(0, position - 100);
          const end = Math.min(text.length, position + 100);
          console.log('   Problematic area (±100 chars from error):');
          console.log('   ' + text.substring(start, end).replace(/\n/g, '\\n'));
          console.log('');
        }

        // For now, throw the error - we can't reliably fix malformed JSON
        throw jsonParseError;
      } catch (repairError) {
        console.error('❌ JSON repair failed');
        console.log('');
        throw jsonParseError; // Re-throw original error
      }
    }

    if (!Array.isArray(tasks)) {
      console.error('❌ Response is not an array');
      console.error('   Type:', typeof tasks);
      console.error('   Value:', tasks);
      throw new Error('Response is not an array');
    }

    console.log(`✅ Received ${tasks.length} tasks from AI`);
    console.log('');
    console.log('📋 Tasks Summary:');
    tasks.forEach((task, i) => {
      console.log(`   ${i + 1}. Type: ${task.type}, Question: ${task.question?.substring(0, 50)}...`);
    });
    console.log('');

    // Transform AI tasks to match database structure
    console.log('🏷️  Transforming AI tasks to match DB structure...');
    const tasksWithMetadata = tasks.map((task, index) => {
      // Strip letter prefixes from options (A), B), C), D)) since UI adds its own
      const cleanOptions = task.options?.map(option => {
        // Remove patterns like "A) ", "B) ", etc. from the beginning
        return option.replace(/^[A-Z]\)\s*/, '');
      }) || [];

      // Clean correctAnswer as well
      let cleanCorrectAnswer = task.correctAnswer;
      if (typeof cleanCorrectAnswer === 'string') {
        cleanCorrectAnswer = cleanCorrectAnswer.replace(/^[A-Z]\)\s*/, '');
      } else if (Array.isArray(cleanCorrectAnswer)) {
        cleanCorrectAnswer = cleanCorrectAnswer.map(ans =>
          typeof ans === 'string' ? ans.replace(/^[A-Z]\)\s*/, '') : ans
        );
      }

      // Prepare content based on task type
      const content: any = {
        task_type: task.type,
        questionText: task.question,
        question_text: task.question,
        statement: task.question,
        correctAnswer: cleanCorrectAnswer,
        correct_answer: cleanCorrectAnswer,
        answer: cleanCorrectAnswer,
      };

      // Add type-specific fields
      if (task.options && task.options.length > 0) {
        content.options = cleanOptions;
      }

      if (task.solution) {
        content.solution = task.solution;
      }

      if (task.pairs) {
        content.pairs = task.pairs;
      }

      // FILL_BLANKS: Convert ___ to [___] format for display
      if (task.type === 'FILL_BLANKS') {
        content.textWithBlanks = task.question.replace(/___/g, '[___]');
        content.text_with_blanks = content.textWithBlanks;
      }

      return {
        id: `ai-${Date.now()}-${index}`,
        title: task.question?.substring(0, 50) || `AI Task ${index + 1}`,
        type: task.type,
        difficulty: params.difficulty[0]?.toUpperCase() || 'MEDIUM',
        content,
        topic: params.topic,
        subject: subjectLabels[params.subject] || params.subject,
        metadata: {
          isAiGenerated: true,
          generatedAt: new Date().toISOString(),
          approved: false,
        }
      };
    });
    console.log('✅ Tasks transformed to DB structure');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ SUCCESS: Generated ${tasksWithMetadata.length} AI tasks`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return {
      tasks: tasksWithMetadata,
      debugInfo: {
        params,
        systemInstruction,
        userPrompt,
        rawResponse,
        parseError,
        timestamp: new Date().toISOString(),
      }
    };
  } catch (error) {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ GEMINI GENERATION ERROR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error Type:', error?.constructor?.name);
    console.error('Error Message:', error?.message);
    console.error('Error Stack:', error?.stack);
    if (error instanceof SyntaxError) {
      console.error('⚠️  JSON Parse Error - Response may be malformed');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    throw new Error('AI yordamida mashqlar yaratishda xatolik yuz berdi');
  }
}

// Mock generation for testing without API key
function generateMockTasks(params: GenerateTasksParams): Task[] {
  const tasks: Task[] = [];
  const subjectName = subjectLabels[params.subject] || params.subject;

  for (let i = 0; i < params.taskCount; i++) {
    const taskType = params.taskTypes[i % params.taskTypes.length];

    switch (taskType) {
      case 'SINGLE_CHOICE':
        tasks.push({
          type: 'SINGLE_CHOICE',
          question: `Test savoli ${i + 1} "${params.topic}" mavzusidan (${subjectName}, ${params.grade}-sinf)`,
          options: [
            'Javob varianti 1',
            'Javob varianti 2',
            'Javob varianti 3',
            'Javob varianti 4',
          ],
          correctAnswer: 'Javob varianti 1',
        });
        break;

      case 'MULTIPLE_CHOICE':
        tasks.push({
          type: 'MULTIPLE_CHOICE',
          question: `Koʻp javobli test ${i + 1} "${params.topic}" mavzusidan (bir nechta toʻgʻri javob tanlang)`,
          options: [
            'Javob varianti 1',
            'Javob varianti 2',
            'Javob varianti 3',
            'Javob varianti 4',
          ],
          correctAnswer: ['Javob varianti 1', 'Javob varianti 3'],
        });
        break;

      case 'TRUE_FALSE':
        tasks.push({
          type: 'TRUE_FALSE',
          question: `Tasdiq ${i + 1}: "${params.topic}" mavzusiga oid tasdiq.`,
          correctAnswer: 'Toʻgʻri',
        });
        break;

      case 'SHORT_ANSWER':
        tasks.push({
          type: 'SHORT_ANSWER',
          question: `Qisqa javob ${i + 1}: "${params.topic}" mavzusidan savol.`,
          correctAnswer: 'Qisqa javob',
        });
        break;

      case 'FILL_BLANK':
        tasks.push({
          type: 'FILL_BLANK',
          question: `Boʻsh joyni toʻldiring ${i + 1}: "${params.topic}" mavzusida muhim tushuncha ___ hisoblanadi.`,
          correctAnswer: 'asosiy soʻz',
        });
        break;

      case 'MATCHING':
        tasks.push({
          type: 'MATCHING',
          question: `Moslashtirish ${i + 1}: Quyidagi juftliklarni moslashtiring`,
          pairs: [
            { left: 'Atama 1', right: 'Taʼrif 1' },
            { left: 'Atama 2', right: 'Taʼrif 2' },
            { left: 'Atama 3', right: 'Taʼrif 3' },
          ],
          correctAnswer: 'Juftliklar toʻgʻri moslashtirilgan',
        });
        break;

      case 'PROBLEM_SOLVING':
        tasks.push({
          type: 'PROBLEM_SOLVING',
          question: `Masala ${i + 1}: "${params.topic}" mavzusidan ${params.grade}-sinf uchun masala yeching.`,
          solution: `Masala ${i + 1} yechimi:\n1. Birinchi qadam...\n2. Ikkinchi qadam...\n3. Javob: ...`,
          correctAnswer: 'Masala javobi',
        });
        break;
    }
  }

  return tasks;
}

export async function testGeminiConnection(): Promise<boolean> {
  try {
    const ai = getGeminiClient();
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: 'Test: 2 + 2 = ?' }]
      },
      config: {
        temperature: 0.1,
        maxOutputTokens: 50,
      },
    });

    return !!(response && response.text && response.text.length > 0);
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}
