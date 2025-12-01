import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { executeSql } from '@/lib/db-helper';

// GET - Получение всех материалов с фильтрами или одного материала по id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const grade = searchParams.get('grade');
    const subjectCode = searchParams.get('subject');
    const topicId = searchParams.get('topic');
    const typeCode = searchParams.get('type'); // TASK, TEST, PROBLEM, etc.

    // Если запрашивается конкретный элемент по ID
    if (id) {
      const sql = `
        SELECT
          ci.id,
          ci.title_uz,
          ci.content,
          ci.difficulty,
          ci.duration_minutes,
          ci.tags,
          ci.status,
          ci.created_at,
          ci.updated_at,
          ci.topic_id,
          ct.code as content_type_code,
          ct.name_uz as content_type_name,
          t.id as topic_id,
          t.title_uz as topic_name,
          t.grade_number,
          s.id as subject_id,
          s.code as subject_code,
          s.name_uz as subject_name
        FROM content_items ci
        JOIN content_types ct ON ci.content_type_id = ct.id
        JOIN topics t ON ci.topic_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE ci.id = '${id}' AND ci.is_active = TRUE;
      `;

      const stdout = await executeSql(sql.replace(/\n/g, ' '), { fieldSeparator: '|' });

      if (!stdout || stdout.trim() === '') {
        return NextResponse.json({
          success: false,
          message: 'Материал не найден',
        }, { status: 404 });
      }

      const parts = stdout.trim().split('|');
      const item = {
        id: parts[0],
        titleUz: parts[1],
        content: parts[2] ? JSON.parse(parts[2]) : {},
        difficulty: parts[3] || null,
        durationMinutes: parts[4] ? parseInt(parts[4]) : null,
        tags: parts[5] ? parts[5].replace(/[{}]/g, '').split(',').filter(t => t) : [],
        status: parts[6],
        createdAt: parts[7],
        updatedAt: parts[8],
        topicId: parts[9],
        type: {
          code: parts[10],
          nameUz: parts[11],
        },
        topic: {
          id: parts[12],
          titleUz: parts[13],
          gradeNumber: parseInt(parts[14]),
        },
        subject: {
          id: parts[15],
          code: parts[16],
          nameUz: parts[17],
        },
      };

      return NextResponse.json({
        success: true,
        data: item,
      });
    }

    // Строим SQL запрос с фильтрами
    let whereConditions: string[] = ['ci.is_active = TRUE'];

    // Базовый запрос с JOIN'ами
    let sql = `
      SELECT
        ci.id,
        ci.title_uz,
        ci.content,
        ci.difficulty,
        ci.duration_minutes,
        ci.tags,
        ci.status,
        ci.created_at,
        ci.updated_at,
        ct.code as content_type_code,
        ct.name_uz as content_type_name,
        t.id as topic_id,
        t.title_uz as topic_name,
        t.grade_number,
        s.id as subject_id,
        s.code as subject_code,
        s.name_uz as subject_name
      FROM content_items ci
      JOIN content_types ct ON ci.content_type_id = ct.id
      JOIN topics t ON ci.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
    `;

    // Фильтр по классу
    if (grade) {
      whereConditions.push(`t.grade_number = ${parseInt(grade)}`);
    }

    // Фильтр по предмету
    if (subjectCode) {
      whereConditions.push(`s.code = '${subjectCode}'`);
    }

    // Фильтр по теме
    if (topicId) {
      whereConditions.push(`t.id = '${topicId}'`);
    }

    // Фильтр по типу контента
    if (typeCode && typeCode !== 'ALL') {
      whereConditions.push(`ct.code = '${typeCode}'`);
    }

    sql += ` WHERE ${whereConditions.join(' AND ')}`;
    sql += ` ORDER BY ci.created_at DESC;`;

    const stdout = await executeSql(sql.replace(/\n/g, ' '), { fieldSeparator: '|' });

    if (!stdout || stdout.trim() === '') {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Парсим результаты
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const items = lines.map(line => {
      const parts = line.split('|');
      return {
        id: parts[0],
        titleUz: parts[1],
        content: parts[2] ? JSON.parse(parts[2]) : {},
        difficulty: parts[3] || null,
        durationMinutes: parts[4] ? parseInt(parts[4]) : null,
        tags: parts[5] ? parts[5].replace(/[{}]/g, '').split(',').filter(t => t) : [],
        status: parts[6],
        createdAt: parts[7],
        updatedAt: parts[8],
        type: {
          code: parts[9],
          nameUz: parts[10],
        },
        topic: {
          id: parts[11],
          titleUz: parts[12],
          gradeNumber: parseInt(parts[13]),
        },
        subject: {
          id: parts[14],
          code: parts[15],
          nameUz: parts[16],
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error('Get content items error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении материалов',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Создание нового материала
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      typeCode,
      topicId,
      titleUz,
      content,
      difficulty,
      durationMinutes,
      tags,
      status = 'DRAFT'
    } = body;

    // Валидация
    if (!typeCode || !topicId || !titleUz || !content) {
      return NextResponse.json(
        { success: false, message: 'Обязательные поля: typeCode, topicId, titleUz, content' },
        { status: 400 }
      );
    }

    // Получаем ID типа контента по коду
    const typeIdSql = `SELECT id FROM content_types WHERE code = '${typeCode}';`;
    const typeIdStdout = await executeSql(typeIdSql);

    if (!typeIdStdout || !typeIdStdout.trim()) {
      return NextResponse.json(
        { success: false, message: 'Неизвестный тип контента' },
        { status: 400 }
      );
    }

    const contentTypeId = typeIdStdout.trim();

    // Экранирование
    const titleUzEsc = titleUz.replace(/'/g, "''");
    const contentJsonB64 = Buffer.from(JSON.stringify(content)).toString('base64');
    const tagsStr = tags && Array.isArray(tags) ? `{${tags.map(t => t.replace(/'/g, "''")).join(',')}}` : '{}';
    const userId = payload.userId;

    // Создаем SQL - используем decode для base64
    const sql = `
      INSERT INTO content_items (
        content_type_id,
        topic_id,
        title_uz,
        content,
        difficulty,
        duration_minutes,
        tags,
        status,
        created_by,
        is_active
      )
      VALUES (
        '${contentTypeId}',
        '${topicId}',
        '${titleUzEsc}',
        convert_from(decode('${contentJsonB64}', 'base64'), 'UTF8')::jsonb,
        ${difficulty ? `'${difficulty}'` : 'NULL'},
        ${durationMinutes || 'NULL'},
        '${tagsStr}',
        '${status}',
        '${userId}',
        TRUE
      )
      RETURNING id;
    `;

    // Используем executeSql для выполнения SQL (передача через stdin)
    const stdout = await executeSql(insertSQL);
    const lines = stdout.trim().split('\n');
    const itemId = lines[0].trim();

    return NextResponse.json({
      success: true,
      message: 'Material muvaffaqiyatli yaratildi',
      data: { id: itemId },
    });
  } catch (error) {
    console.error('Create content item error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Materialda xatolik yuz berdi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Обновление материала
export async function PUT(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      id,
      titleUz,
      content,
      difficulty,
      durationMinutes,
      tags,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID обязателен' },
        { status: 400 }
      );
    }

    // Экранирование
    const titleUzEsc = titleUz.replace(/'/g, "''");
    const contentJsonB64 = Buffer.from(JSON.stringify(content)).toString('base64');
    const tagsStr = tags && Array.isArray(tags) ? `{${tags.map(t => t.replace(/'/g, "''")).join(',')}}` : '{}';

    // Используем decode для base64
    const sql = `
      UPDATE content_items
      SET
        title_uz = '${titleUzEsc}',
        content = convert_from(decode('${contentJsonB64}', 'base64'), 'UTF8')::jsonb,
        difficulty = ${difficulty ? `'${difficulty}'` : 'NULL'},
        duration_minutes = ${durationMinutes || 'NULL'},
        tags = '${tagsStr}',
        status = '${status || 'DRAFT'}',
        updated_at = NOW()
      WHERE id = '${id}';
    `;

    // Используем executeSql для выполнения SQL (передача через stdin)
    await executeSql(sql);

    return NextResponse.json({
      success: true,
      message: 'Material muvaffaqiyatli yangilandi',
    });
  } catch (error) {
    console.error('Update content item error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Materialni yangilashda xatolik',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Удаление материала (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID обязателен' },
        { status: 400 }
      );
    }

    // Soft delete
    const sql = `UPDATE content_items SET is_active = FALSE WHERE id = '${id}';`;

    await executeSql(sql);

    return NextResponse.json({
      success: true,
      message: 'Material muvaffaqiyatli oʻchirildi',
    });
  } catch (error) {
    console.error('Delete content item error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Materialni oʻchirishda xatolik',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
