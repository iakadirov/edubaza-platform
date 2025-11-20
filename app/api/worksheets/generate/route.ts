import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import { exec } from 'child_process';
import { promisify } from 'util';
import { generateTasks, GenerateTasksParams, Task } from '@/lib/gemini';

const execAsync = promisify(exec);

// Функция для получения задач из базы данных
async function fetchTasksFromDatabase(params: {
  subject: string;
  grade: number;
  topicId?: string | null;
  quarter?: number | null;
  week?: number | null;
  taskCount: number;
  difficulty: string | string[];
  taskTypes: string[];
}) {
  const { subject, grade, topicId, quarter, week, taskCount, difficulty, taskTypes } = params;

  try {
    // Строим SQL запрос для получения задач из content_items
    let whereConditions: string[] = [
      'ci.is_active = TRUE',
      'ct.code = \'TASK\'',  // Только задачи
      'ci.status = \'PUBLISHED\'',  // Только опубликованные
    ];

    // Фильтр по классу
    whereConditions.push(`t.grade_number = ${grade}`);

    // Фильтр по предмету
    whereConditions.push(`s.code = '${subject}'`);

    // Фильтр по теме ИЛИ по четверти/неделе
    if (topicId) {
      whereConditions.push(`ci.topic_id = '${topicId}'`);
    } else if (quarter) {
      whereConditions.push(`t.quarter = ${quarter}`);
      if (week) {
        whereConditions.push(`t.week_number = ${week}`);
      }
    }

    // Фильтр по сложности (если указана)
    if (difficulty) {
      if (Array.isArray(difficulty) && difficulty.length > 0) {
        const difficultyConditions = difficulty.map(d => `ci.difficulty = '${d}'`).join(' OR ');
        whereConditions.push(`(${difficultyConditions})`);
      } else if (typeof difficulty === 'string' && difficulty !== 'ALL') {
        whereConditions.push(`ci.difficulty = '${difficulty}'`);
      }
    }

    // Фильтр по типам задач (проверяем content.task_type)
    if (taskTypes && taskTypes.length > 0) {
      const taskTypeConditions = taskTypes.map(type => `ci.content->>'task_type' = '${type}'`).join(' OR ');
      whereConditions.push(`(${taskTypeConditions})`);
    }

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

    console.log('SQL Query:', sql.replace(/\n/g, ' ').replace(/\s+/g, ' '));

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ')}"`,
      { maxBuffer: 50 * 1024 * 1024 } // 50MB buffer
    );

    if (!stdout || stdout.trim() === '') {
      return [];
    }

    // Парсим результаты
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const tasks = lines.map(line => {
      const parts = line.split('|');
      const content = parts[2] ? JSON.parse(parts[2]) : {};

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

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks from database:', error);
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
    const { subject, grade, topic, topicId, quarter, week, taskCount, difficulty, taskTypes, language, aiPercentage } = body;

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
    console.log(`   Language: ${contentLanguage}`);
    console.log(`   AI Percentage: ${aiPercentage}%`);
    console.log('');

    let tasks: any[];

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
        const aiParams: GenerateTasksParams = {
          subject,
          grade: Number(grade),
          topic: topic || topicId || `${subject} - ${grade}-sinf`,
          taskCount: aiTaskCount,
          difficulty: mappedDifficulty,
          taskTypes,
        };

        console.log('📋 AI Generation Parameters:');
        console.log(`   Subject: ${aiParams.subject}`);
        console.log(`   Grade: ${aiParams.grade}`);
        console.log(`   Topic: ${aiParams.topic}`);
        console.log(`   Task Count: ${aiParams.taskCount}`);
        console.log(`   Difficulty: ${aiParams.difficulty}`);
        console.log(`   Task Types: ${aiParams.taskTypes.join(', ')}`);
        console.log('');
        console.log('🚀 Calling generateTasks()...');
        console.log('');

        aiTasks = await generateTasks(aiParams);

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
    };

    // Используем spawn для передачи SQL через stdin
    const { spawn } = require('child_process');

    const configJson = JSON.stringify(config).replace(/'/g, "''");
    const tasksJson = JSON.stringify(tasks).replace(/'/g, "''");
    const topicEscaped = topic ? topic.replace(/'/g, "''") : (quarter ? `${quarter}-chorak${week ? ` ${week}-hafta` : ''}` : '');
    const topicIdValue = topicId ? `'${topicId}'` : 'NULL';

    const sql = `INSERT INTO worksheets (id, "userId", subject, grade, "topicUz", "topicRu", topic_id, config, tasks, status, "generatedAt", "updatedAt") VALUES (gen_random_uuid()::text, '${user.id}', '${subject}', ${Number(grade)}, '${topicEscaped}', '${topicEscaped}', ${topicIdValue}, '${configJson}', '${tasksJson}', 'COMPLETED', NOW(), NOW()) RETURNING id;`;

    // Используем spawn с stdin для безопасной передачи SQL
    const worksheetId = await new Promise<string>((resolve, reject) => {
      const proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', 'psql', '-U', 'edubaza', '-d', 'edubaza', '-t', '-A']);

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`SQL execution failed: ${stderr}`));
        } else {
          // Парсим первую строку (UUID), игнорируя "INSERT 0 1"
          const lines = stdout.trim().split('\n');
          const worksheetId = lines[0].trim();
          resolve(worksheetId);
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });

      // Передаем SQL через stdin
      proc.stdin.write(sql);
      proc.stdin.end();
    });
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
