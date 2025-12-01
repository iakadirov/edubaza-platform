import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { executeSql } from '@/lib/db-helper';

// POST - Bulk import topics
export async function POST(request: NextRequest) {
  try {
    // Authorization check
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
    const { subjectId, gradeNumber, topics } = body;

    // Validation
    if (!subjectId || !gradeNumber || !topics || !Array.isArray(topics)) {
      return NextResponse.json(
        { success: false, message: 'Обязательные поля: subjectId, gradeNumber, topics[]' },
        { status: 400 }
      );
    }

    if (topics.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Список тем пуст' },
        { status: 400 }
      );
    }

    // Build INSERT statements
    const values = topics.map(topic => {
      const titleEsc = topic.title.replace(/'/g, "''");
      const quarter = topic.quarter || 'NULL';
      const week = topic.weekNumber || 'NULL';
      const sortOrder = topic.sortOrder || 'NULL';

      return `('${subjectId}', ${gradeNumber}, '${titleEsc}', ${quarter}, ${week}, ${sortOrder})`;
    }).join(',\n');

    const sql = `
      INSERT INTO topics (subject_id, grade_number, title_uz, quarter, week_number, sort_order)
      VALUES ${values}
      RETURNING id;
    `;

    const stdout = await executeSql(sql.replace(/\n/g, ' '));

    const insertedIds = stdout.trim().split('\n').filter(line => line.trim());

    return NextResponse.json({
      success: true,
      message: `${insertedIds.length} ta mavzu muvaffaqiyatli qo'shildi`,
      data: {
        count: insertedIds.length,
        ids: insertedIds,
      },
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ommaviy import xatosi',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
