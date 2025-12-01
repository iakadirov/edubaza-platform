import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import { executeSql } from '@/lib/db-helper';
import { generateTasks, GenerateTasksParams, Task } from '@/lib/gemini';

// Функция для получения задач из базы данных с прогрессивным упрощением фильтров
async function fetchTasksFromDatabase(params: {
  subject: string;
  grade: number;
  topicId?: string | null;
  quarter?: number | null;
  week?: number | null;
  taskCount: number;
  difficulty: string | string[];
  taskTypes: string[];
  format?: string;
}) {
  const { subject, grade, topicId, quarter, week, taskCount, difficulty, taskTypes, format } = params;

  // Вспомогательная функция для выполнения SQL запроса
  async function executeQuery(whereConditions: string[], attemptLevel: number, attemptDescription: string): Promise<any[]> {
    const sql = `
      SELECT
        ci.id,
        ci.title_uz,
        ci.content,
        ci.difficulty,
        ci.duration_minutes,
        ct.code as content_type_code,
        t.title_uz as topic_title,
        s.code as subject_code,
        s.name_uz as subject_name
      FROM content_items ci
      JOIN content_types ct ON ci.content_type_id = ct.id
      JOIN topics t ON ci.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY RANDOM()
      LIMIT ${taskCount};
    `;

    console.log(`📍 Attempt ${attemptLevel}: ${attemptDescription}`);
    console.log('   SQL:', sql.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim());

    try {
      const stdout = await executeSql(sql.replace(/\n/g, ' '), { fieldSeparator: '|' });

      if (!stdout || stdout.trim() === '') {
        console.log(`   ❌ No results found`);
        return [];
      }

      // Парсим результаты
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const tasks = lines.map(line => {
        const parts = line.split('|');
        const content = parts[2] ? JSON.parse(parts[2]) : {};

        // Ensure questionText is in content for TaskRenderer compatibility
        if (!content.questionText && content.question_text) {
          content.questionText = content.question_text;
        }

        // FILL_BLANKS: Convert ___ to [___] format
        if (content.task_type === 'FILL_BLANKS' && content.question_text) {
          content.textWithBlanks = content.question_text.replace(/___/g, '[___]');
        }

        // MATCHING: Convert left_column/right_column format to pairs array
        if (content.task_type === 'MATCHING' && content.left_column && content.right_column && content.correct_pairs) {
          content.pairs = content.correct_pairs.map((pair: any) => ({
            left: content.left_column[pair.left],
            right: content.right_column[pair.right]
          }));
        }

        return {
          id: parts[0],
          title: parts[1],
          type: content.task_type || 'SINGLE_CHOICE',
          difficulty: parts[3] || 'MEDIUM',
          content: content,
          topic: parts[6],
          subject: parts[8],
        };
      });

      console.log(`   ✅ Found ${tasks.length} tasks`);
      return tasks;
    } catch (error) {
      console.error(`   ⚠️  Query failed:`, error);
      return [];
    }
  }

  try {
    console.log('');
    console.log('🔍 PROGRESSIVE FILTER STRATEGY - Attempting to maximize results');
    console.log('');

    // Базовые условия (всегда применяются)
    const baseConditions: string[] = [
      'ci.is_active = TRUE',
      'ct.code = \'TASK\'',
      'ci.status = \'PUBLISHED\'',
      `t.grade_number = ${grade}`,
      `s.code = '${subject}'`,
    ];

    // Фильтр по теме ИЛИ по четверти/неделе
    if (topicId) {
      baseConditions.push(`ci.topic_id = '${topicId}'`);
    } else if (quarter) {
      baseConditions.push(`t.quarter = ${quarter}`);
      if (week) {
        baseConditions.push(`t.week_number = ${week}`);
      }
    }

    // УРОВЕНЬ 1: Полное соответствие всем фильтрам
    let whereConditions = [...baseConditions];

    // Фильтр по сложности
    let hasDifficultyFilter = false;
    if (difficulty) {
      if (Array.isArray(difficulty) && difficulty.length > 0) {
        const difficultyConditions = difficulty.map(d => `ci.difficulty = '${d}'`).join(' OR ');
        whereConditions.push(`(${difficultyConditions})`);
        hasDifficultyFilter = true;
      } else if (typeof difficulty === 'string' && difficulty !== 'ALL') {
        whereConditions.push(`ci.difficulty = '${difficulty}'`);
        hasDifficultyFilter = true;
      }
    }

    // Фильтр по типам задач
    let hasTaskTypeFilter = false;
    if (taskTypes && taskTypes.length > 0) {
      const taskTypeConditions = taskTypes.map(type => `ci.content->>'task_type' = '${type}'`).join(' OR ');
      whereConditions.push(`(${taskTypeConditions})`);
      hasTaskTypeFilter = true;
    }

    // Фильтр по формату
    let hasFormatFilter = false;
    if (format && format !== 'STANDARD' && format !== 'ALL') {
      whereConditions.push(`ci.tags @> ARRAY['${format}']::text[]`);
      hasFormatFilter = true;
    }

    let tasks = await executeQuery(whereConditions, 1, 'Exact match (all filters)');

    if (tasks.length >= taskCount) {
      console.log(`✅ SUCCESS at Level 1: Found sufficient tasks (${tasks.length}/${taskCount})`);
      console.log('');
      return tasks;
    }

    // УРОВЕНЬ 2: Убираем фильтр по типам задач (берем любые доступные типы)
    if (hasTaskTypeFilter) {
      whereConditions = [...baseConditions];

      if (hasDifficultyFilter) {
        if (Array.isArray(difficulty) && difficulty.length > 0) {
          const difficultyConditions = difficulty.map(d => `ci.difficulty = '${d}'`).join(' OR ');
          whereConditions.push(`(${difficultyConditions})`);
        } else if (typeof difficulty === 'string' && difficulty !== 'ALL') {
          whereConditions.push(`ci.difficulty = '${difficulty}'`);
        }
      }

      if (hasFormatFilter) {
        whereConditions.push(`ci.tags @> ARRAY['${format}']::text[]`);
      }

      tasks = await executeQuery(whereConditions, 2, 'Relaxed task types (using any available types)');

      if (tasks.length >= taskCount) {
        console.log(`✅ SUCCESS at Level 2: Found sufficient tasks (${tasks.length}/${taskCount})`);
        console.log('');
        return tasks;
      }
    }

    // УРОВЕНЬ 3: Убираем фильтр по сложности (берем MIX - все уровни)
    if (hasDifficultyFilter) {
      whereConditions = [...baseConditions];

      if (hasFormatFilter) {
        whereConditions.push(`ci.tags @> ARRAY['${format}']::text[]`);
      }

      tasks = await executeQuery(whereConditions, 3, 'Relaxed difficulty (MIX - all levels)');

      if (tasks.length >= taskCount) {
        console.log(`✅ SUCCESS at Level 3: Found sufficient tasks (${tasks.length}/${taskCount})`);
        console.log('');
        return tasks;
      }
    }

    // УРОВЕНЬ 4: Убираем фильтр по формату
    if (hasFormatFilter) {
      whereConditions = [...baseConditions];

      tasks = await executeQuery(whereConditions, 4, 'Relaxed format (any format)');

      if (tasks.length >= taskCount) {
        console.log(`✅ SUCCESS at Level 4: Found sufficient tasks (${tasks.length}/${taskCount})`);
        console.log('');
        return tasks;
      }
    }

    // УРОВЕНЬ 5: Только базовые фильтры (класс + предмет + тема)
    whereConditions = [...baseConditions];
    tasks = await executeQuery(whereConditions, 5, 'Base filters only (grade + subject + topic)');

    if (tasks.length > 0) {
      console.log(`✅ SUCCESS at Level 5: Found ${tasks.length} tasks with minimal filters`);
      console.log('');
      return tasks;
    }

    console.log('❌ FAILED: No tasks found even with minimal filters');
    console.log('');
    return [];

  } catch (error) {
    console.error('Error in progressive filter strategy:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем токен
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Токен авторизации не найден' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный или истёкший токен' },
        { status: 401 }
      );
    }

    // Получаем пользователя
    const user = await findUserByPhone(payload.phone);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Парсим body
    const body = await request.json();
    const { subject, grade, topic, topicId, quarter, week, taskCount, difficulty, taskTypes, language, aiPercentage, format, customInstructions } = body;

    // Валидация
    if (!subject || !grade || !taskCount || !difficulty || !taskTypes) {
      return NextResponse.json(
        { success: false, message: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, что указана либо тема, либо четверть (опционально)
    // Если не указано - берем задачи из всех тем для данного предмета и класса
    // if (!topicId && !quarter) {
    //   return NextResponse.json(
    //     { success: false, message: 'Укажите либо тему, либо четверть' },
    //     { status: 400 }
    //   );
    // }

    if (!Array.isArray(taskTypes) || taskTypes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Выберите хотя бы один тип заданий' },
        { status: 400 }
      );
    }

    // Устанавливаем язык по умолчанию, если не указан
    const contentLanguage = language || 'ru';

    // TODO: Проверка лимитов пользователя (для будущих спринтов)
    // const limits = JSON.parse(user.limits);
    // const usage = JSON.parse(user.usage);
    // if (usage.worksheetsThisMonth >= limits.worksheetsPerMonth) {
    //   return NextResponse.json(
    //     { success: false, message: 'Превышен лимит worksheets на текущий месяц' },
    //     { status: 403 }
    //   );
    // }

    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║      WORKSHEET GENERATION - DETAILED LOGS           ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📥 REQUEST PARAMETERS:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   User Phone: ${payload.phone}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Grade: ${grade}`);
    console.log(`   Topic: ${topic || 'not specified'}`);
    console.log(`   Topic ID: ${topicId || 'not specified'}`);
    console.log(`   Quarter: ${quarter || 'not specified'}`);
    console.log(`   Week: ${week || 'not specified'}`);
    console.log(`   Task Count: ${taskCount}`);
    console.log(`   Difficulty: ${Array.isArray(difficulty) ? difficulty.join(', ') : difficulty}`);
    console.log(`   Task Types: ${taskTypes.join(', ')}`);
    console.log(`   Format: ${format || 'STANDARD'}`);
    console.log(`   Language: ${contentLanguage}`);
    console.log(`   AI Percentage: ${aiPercentage}%`);
    console.log(`   Custom Instructions: ${customInstructions || 'none'}`);
    console.log('');

    let tasks: any[];
    let aiDebugInfo: any = null; // Will store AI generation debug info

    // Calculate AI and DB task counts based on aiPercentage (0-100)
    const aiPercent = aiPercentage !== undefined ? Number(aiPercentage) : 0;
    const aiTaskCount = Math.round(taskCount * aiPercent / 100);
    const dbTaskCount = taskCount - aiTaskCount;

    console.log('🔢 TASK DISTRIBUTION CALCULATION:');
    console.log(`   Total requested: ${taskCount} tasks`);
    console.log(`   AI Percentage: ${aiPercent}%`);
    console.log(`   AI Tasks: ${aiTaskCount} (${Math.round(taskCount * aiPercent / 100)} rounded)`);
    console.log(`   DB Tasks: ${dbTaskCount}`);
    console.log(`   Formula: AI = round(${taskCount} * ${aiPercent}/100) = ${aiTaskCount}`);
    console.log('');

    // Choose generation method: AI, Database, or Hybrid
    if (aiPercent > 0 && aiTaskCount > 0) {
      console.log('🤖 HYBRID MODE: Using both AI and Database');
      console.log(`   AI Tasks to generate: ${aiTaskCount}`);
      console.log(`   DB Tasks to fetch: ${dbTaskCount}`);
      console.log('');

      // Convert difficulty to Uzbek format for AI
      let aiDifficulty = difficulty;
      if (Array.isArray(difficulty)) {
        aiDifficulty = difficulty[0]; // Take first difficulty level
        console.log(`⚠️  Multiple difficulties selected: [${difficulty.join(', ')}]`);
        console.log(`   Using first difficulty for AI: ${aiDifficulty}`);
      }

      const difficultyMap: Record<string, 'oson' | 'oʻrta' | 'qiyin'> = {
        'EASY': 'oson',
        'MEDIUM': 'oʻrta',
        'HARD': 'qiyin',
      };

      const mappedDifficulty = difficultyMap[aiDifficulty] || 'oʻrta';
      console.log(`   Difficulty mapping: ${aiDifficulty} → ${mappedDifficulty}`);
      console.log('');

      let aiTasks: any[] = [];
      let dbTasks: any[] = [];

      // Generate AI tasks
      console.log('┌─────────────────────────────────────────┐');
      console.log('│  STEP 1: AI TASK GENERATION             │');
      console.log('└─────────────────────────────────────────┘');
      try {
        // DTS Format Conflict Resolution
        // DTS (State Test) should only be used with SINGLE_CHOICE tasks
        // If mixed task types are selected, use a different format
        let effectiveFormat = format || 'STANDARD';
        if (effectiveFormat === 'DTS' && !taskTypes.every((t: string) => t === 'SINGLE_CHOICE')) {
          console.log('⚠️  FORMAT CONFLICT DETECTED:');
          console.log('   DTS format requires ONLY SINGLE_CHOICE tasks');
          console.log(`   But task types include: ${taskTypes.join(', ')}`);
          console.log('   Changing format to: STANDARD');
          effectiveFormat = 'STANDARD';
        }
        console.log('');

        const aiParams: GenerateTasksParams = {
          subject,
          grade: Number(grade),
          topic: topic || topicId || `${subject} - ${grade}-sinf`,
          taskCount: aiTaskCount,
          difficulty: mappedDifficulty,
          taskTypes,
          format: effectiveFormat,
          customInstructions,
        };

        console.log('📋 AI Generation Parameters:');
        console.log(`   Subject: ${aiParams.subject}`);
        console.log(`   Grade: ${aiParams.grade}`);
        console.log(`   Topic: ${aiParams.topic}`);
        console.log(`   Task Count: ${aiParams.taskCount}`);
        console.log(`   Difficulty: ${aiParams.difficulty}`);
        console.log(`   Task Types: ${aiParams.taskTypes.join(', ')}`);
        console.log(`   Format: ${aiParams.format}`);
        console.log('');
        console.log('🚀 Calling generateTasks()...');
        console.log('');

        const result = await generateTasks(aiParams);
        aiTasks = result.tasks;
        aiDebugInfo = result.debugInfo;

        console.log('');
        console.log(`✅ AI Generation Complete: ${aiTasks.length} tasks generated`);
        console.log('');
      } catch (aiError) {
        console.log('');
        console.error('❌ AI GENERATION FAILED');
        console.error('   Error:', aiError);
        console.error('   Will compensate by fetching more tasks from database');
        console.log('');
        // If AI fails, we'll fetch more from DB to compensate
      }

      // Fetch DB tasks if needed
      if (dbTaskCount > 0) {
        console.log('┌─────────────────────────────────────────┐');
        console.log('│  STEP 2: DATABASE TASK FETCHING        │');
        console.log('└─────────────────────────────────────────┘');
        try {
          // If AI failed, fetch the full amount from DB
          const dbFetchCount = aiTasks.length < aiTaskCount ? taskCount - aiTasks.length : dbTaskCount;

          console.log('📋 Database Fetch Parameters:');
          console.log(`   Originally needed: ${dbTaskCount} tasks`);
          console.log(`   AI generated: ${aiTasks.length} tasks`);
          console.log(`   AI expected: ${aiTaskCount} tasks`);
          console.log(`   Compensating for shortfall: ${aiTasks.length < aiTaskCount ? 'YES' : 'NO'}`);
          console.log(`   Fetching from DB: ${dbFetchCount} tasks`);
          console.log('');

          dbTasks = await fetchTasksFromDatabase({
            subject,
            grade: Number(grade),
            topicId,
            quarter: quarter ? Number(quarter) : null,
            week: week ? Number(week) : null,
            taskCount: dbFetchCount,
            difficulty,
            taskTypes,
            format,
          });
          console.log(`✅ Database Fetch Complete: ${dbTasks.length} tasks fetched`);
          console.log('');
        } catch (dbError) {
          console.log('');
          console.error('❌ DATABASE FETCH FAILED');
          console.error('   Error:', dbError);
          console.log('');
        }
      } else {
        console.log('ℹ️  Skipping database fetch (0% database tasks requested)');
        console.log('');
      }

      // Merge AI and DB tasks
      tasks = [...aiTasks, ...dbTasks];
      console.log('┌─────────────────────────────────────────┐');
      console.log('│  FINAL RESULT                           │');
      console.log('└─────────────────────────────────────────┘');
      console.log(`   Total tasks: ${tasks.length}`);
      console.log(`   AI tasks: ${aiTasks.length}`);
      console.log(`   DB tasks: ${dbTasks.length}`);
      console.log(`   Original request: ${taskCount} tasks`);
      console.log(`   Fulfillment: ${Math.round(tasks.length / taskCount * 100)}%`);
      console.log('');
    } else {
      // 100% database tasks
      console.log('💾 DATABASE ONLY MODE (0% AI)');
      console.log('');
      console.log('┌─────────────────────────────────────────┐');
      console.log('│  DATABASE TASK FETCHING                 │');
      console.log('└─────────────────────────────────────────┘');
      console.log('📋 Database Fetch Parameters:');
      console.log(`   Fetching: ${taskCount} tasks`);
      console.log('');

      tasks = await fetchTasksFromDatabase({
        subject,
        grade: Number(grade),
        topicId,
        quarter: quarter ? Number(quarter) : null,
        week: week ? Number(week) : null,
        taskCount: Number(taskCount),
        difficulty,
        taskTypes,
        format,
      });

      console.log(`✅ Database Fetch Complete: ${tasks.length} tasks fetched`);
      console.log('');
    }

    if (tasks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tanlangan parametrlar boʻyicha topshiriqlar topilmadi. Iltimos, boshqa parametrlarni tanlang yoki yangi topshiriqlar yarating.'
        },
        { status: 404 }
      );
    }

    // Сохраняем worksheet в базу данных
    const config = {
      taskCount,
      difficulty,
      taskTypes,
      aiPercentage: aiPercent,
    };

    const configJson = JSON.stringify(config).replace(/'/g, "''");
    const tasksJson = JSON.stringify(tasks).replace(/'/g, "''");
    const debugInfoJson = aiDebugInfo ? JSON.stringify(aiDebugInfo).replace(/'/g, "''") : null;
    const topicEscaped = topic ? topic.replace(/'/g, "''") : (quarter ? `${quarter}-chorak${week ? ` ${week}-hafta` : ''}` : '');
    const topicIdValue = topicId ? `'${topicId}'` : 'NULL';
    const debugInfoValue = debugInfoJson ? `'${debugInfoJson}'` : 'NULL';

    const sql = `INSERT INTO worksheets (id, "userId", subject, grade, "topicUz", "topicRu", topic_id, config, tasks, ai_debug_info, status, "generatedAt", "updatedAt") VALUES (gen_random_uuid()::text, '${user.id}', '${subject}', ${Number(grade)}, '${topicEscaped}', '${topicEscaped}', ${topicIdValue}, '${configJson}', '${tasksJson}', ${debugInfoValue}, 'COMPLETED', NOW(), NOW()) RETURNING id;`;

    const stdout = await executeSql(sql);
    const worksheetId = stdout.trim().split('\n')[0].trim();
    console.log('Worksheet saved with ID:', worksheetId);

    // TODO: Обновить usage пользователя (для будущих спринтов)

    return NextResponse.json({
      success: true,
      message: 'Worksheet успешно создан',
      data: {
        worksheetId,
        tasksCount: tasks.length,
      },
    });
  } catch (error) {
    console.error('Generate worksheet error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при создании worksheet',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
