import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyToken } from '@/lib/jwt';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject'); // UUID предмета
    const subjectCode = searchParams.get('subjectCode'); // Или код предмета
    const grade = searchParams.get('grade'); // Класс
    const quarter = searchParams.get('quarter'); // Четверть

    // Строим SQL запрос с фильтрами
    let whereConditions: string[] = ['t.is_active = TRUE'];

    if (subjectId) {
      whereConditions.push(`t.subject_id = '${subjectId}'`);
    }

    if (subjectCode) {
      whereConditions.push(`s.code = '${subjectCode}'`);
    }

    if (grade) {
      whereConditions.push(`t.grade_number = ${parseInt(grade)}`);
    }

    if (quarter) {
      whereConditions.push(`t.quarter = ${parseInt(quarter)}`);
    }

    const sql = `
      SELECT t.id, t.subject_id, t.grade_number, t.title_uz,
             t.description_uz, t.quarter, t.week_number,
             t.keywords, t.sort_order,
             s.code as subject_code, s.name_uz as subject_name_uz
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY t.quarter, t.sort_order, t.title_uz;
    `;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ')}"`
    );

    if (!stdout || stdout.trim() === '') {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    // Парсим результаты
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const topics = lines.map(line => {
      const parts = line.split('|');
      const weekNumber = parts[6] ? parseInt(parts[6]) : null;
      return {
        id: parts[0],
        subjectId: parts[1],
        gradeNumber: parseInt(parts[2]),
        titleUz: parts[3],
        descriptionUz: parts[4] || null,
        quarter: parts[5] ? parseInt(parts[5]) : null,
        weekNumber: weekNumber,
        keywords: parts[7] ? parts[7].replace(/[{}]/g, '').split(',').filter(k => k.trim()) : [],
        sortOrder: parseInt(parts[8] || '0'),
        subject: {
          code: parts[9],
          nameUz: parts[10],
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: topics,
      count: topics.length,
    });
  } catch (error) {
    console.error('Get topics error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении тем',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new topic
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
    const { subjectId, gradeNumber, titleUz, descriptionUz, quarter, weekNumber, keywords, sortOrder } = body;

    // Валидация
    if (!subjectId || !gradeNumber || !titleUz) {
      return NextResponse.json(
        { success: false, message: 'Обязательные поля: subjectId, gradeNumber, titleUz' },
        { status: 400 }
      );
    }

    // Экранирование
    const titleUzEsc = titleUz.replace(/'/g, "''");
    const descUzEsc = descriptionUz ? descriptionUz.replace(/'/g, "''") : '';
    const keywordsStr = keywords && Array.isArray(keywords) ? `{${keywords.join(',')}}` : '{}';

    const sql = `
      INSERT INTO topics (subject_id, grade_number, title_uz, description_uz, quarter, week_number, keywords, sort_order, is_active)
      VALUES ('${subjectId}', ${gradeNumber}, '${titleUzEsc}', '${descUzEsc}', ${quarter || 'NULL'}, ${weekNumber || 'NULL'}, '${keywordsStr}', ${sortOrder || 0}, TRUE)
      RETURNING id;
    `;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "${sql.replace(/\n/g, ' ')}"`
    );

    const topicId = stdout.trim().split('\n')[0];

    return NextResponse.json({
      success: true,
      message: 'Тема успешно создана',
      data: { id: topicId },
    });
  } catch (error) {
    console.error('Create topic error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при создании темы',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update topic
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
    const { id, subjectId, gradeNumber, titleUz, descriptionUz, quarter, weekNumber, keywords, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID обязателен' },
        { status: 400 }
      );
    }

    // Экранирование
    const titleUzEsc = titleUz.replace(/'/g, "''");
    const descUzEsc = descriptionUz ? descriptionUz.replace(/'/g, "''") : '';
    const keywordsStr = keywords && Array.isArray(keywords) ? `{${keywords.join(',')}}` : '{}';

    const sql = `
      UPDATE topics
      SET subject_id = '${subjectId}',
          grade_number = ${gradeNumber},
          title_uz = '${titleUzEsc}',
          description_uz = '${descUzEsc}',
          quarter = ${quarter || 'NULL'},
          week_number = ${weekNumber || 'NULL'},
          keywords = '${keywordsStr}',
          sort_order = ${sortOrder || 0},
          updated_at = NOW()
      WHERE id = '${id}';
    `;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${sql.replace(/\n/g, ' ')}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Тема успешно обновлена',
    });
  } catch (error) {
    console.error('Update topic error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при обновлении темы',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete topic (soft delete)
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
    const sql = `UPDATE topics SET is_active = FALSE WHERE id = '${id}';`;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${sql}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Тема успешно удалена',
    });
  } catch (error) {
    console.error('Delete topic error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении темы',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
