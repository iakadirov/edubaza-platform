import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyToken } from '@/lib/jwt';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade'); // Опциональный фильтр по классу

    let sql: string;

    if (grade) {
      // Получаем предметы для конкретного класса
      sql = `
        SELECT DISTINCT s.id, s.code, s.name_uz, s.description_uz,
               s.icon, s.color, s.sort_order
        FROM subjects s
        JOIN subject_grades sg ON s.id = sg.subject_id
        WHERE sg.grade_number = ${parseInt(grade)}
          AND sg.is_active = TRUE
          AND s.is_active = TRUE
        ORDER BY s.sort_order;
      `;
    } else {
      // Получаем все предметы
      sql = `
        SELECT id, code, name_uz, description_uz,
               icon, color, sort_order
        FROM subjects
        WHERE is_active = TRUE
        ORDER BY sort_order;
      `;
    }

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ')}"`
    );

    if (!stdout || stdout.trim() === '') {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Парсим результаты
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const subjects = lines.map(line => {
      const parts = line.split('|');
      return {
        id: parts[0],
        code: parts[1],
        nameUz: parts[2],
        descriptionUz: parts[3] || null,
        icon: parts[4] || null,
        color: parts[5] || null,
        sortOrder: parseInt(parts[6] || '0'),
      };
    });

    // Загружаем классы для каждого предмета
    for (const subject of subjects) {
      const gradesSql = `
        SELECT grade_number
        FROM subject_grades
        WHERE subject_id = '${subject.id}' AND is_active = TRUE
        ORDER BY grade_number;
      `;

      try {
        const { stdout: gradesStdout } = await execAsync(
          `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "${gradesSql.replace(/\n/g, ' ')}"`
        );

        if (gradesStdout && gradesStdout.trim()) {
          const gradeLines = gradesStdout.trim().split('\n').filter(line => line.trim());
          (subject as any).grades = gradeLines.map(line => parseInt(line));
        } else {
          (subject as any).grades = [];
        }
      } catch (err) {
        console.error(`Error loading grades for subject ${subject.id}:`, err);
        (subject as any).grades = [];
      }
    }

    return NextResponse.json({
      success: true,
      data: subjects,
      count: subjects.length,
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении предметов',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Create new subject
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
    const { code, nameUz, descriptionUz, icon, color, sortOrder, grades } = body;

    // Валидация
    if (!code || !nameUz) {
      return NextResponse.json(
        { success: false, message: 'Обязательные поля: code, nameUz' },
        { status: 400 }
      );
    }

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Необходимо выбрать хотя бы один класс' },
        { status: 400 }
      );
    }

    // Экранирование
    const codeEsc = code.replace(/'/g, "''");
    const nameUzEsc = nameUz.replace(/'/g, "''");
    const descUzEsc = descriptionUz ? descriptionUz.replace(/'/g, "''") : '';
    const iconEsc = icon ? icon.replace(/'/g, "''") : '📚';
    const colorEsc = color ? color.replace(/'/g, "''") : '#3B82F6';
    const sort = sortOrder || 0;

    const sql = `
      INSERT INTO subjects (code, name_uz, description_uz, icon, color, sort_order, is_active)
      VALUES ('${codeEsc}', '${nameUzEsc}', '${descUzEsc}', '${iconEsc}', '${colorEsc}', ${sort}, TRUE)
      RETURNING id;
    `;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -c "${sql.replace(/\n/g, ' ')}"`
    );

    const subjectId = stdout.trim().split('\n')[0];

    // Если указаны классы, добавляем связи
    if (grades && Array.isArray(grades) && grades.length > 0) {
      const gradesSql = grades.map(g =>
        `INSERT INTO subject_grades (subject_id, grade_number, is_active) VALUES ('${subjectId}', ${g}, TRUE);`
      ).join(' ');

      await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${gradesSql}"`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Предмет успешно создан',
      data: { id: subjectId },
    });
  } catch (error) {
    console.error('Create subject error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при создании предмета',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update subject
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
    const { id, code, nameUz, descriptionUz, icon, color, sortOrder, grades } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID обязателен' },
        { status: 400 }
      );
    }

    // Экранирование
    const codeEsc = code.replace(/'/g, "''");
    const nameUzEsc = nameUz.replace(/'/g, "''");
    const descUzEsc = descriptionUz ? descriptionUz.replace(/'/g, "''") : '';
    const iconEsc = icon ? icon.replace(/'/g, "''") : '📚';
    const colorEsc = color ? color.replace(/'/g, "''") : '#3B82F6';

    const sql = `
      UPDATE subjects
      SET code = '${codeEsc}',
          name_uz = '${nameUzEsc}',
          description_uz = '${descUzEsc}',
          icon = '${iconEsc}',
          color = '${colorEsc}',
          sort_order = ${sortOrder || 0},
          updated_at = NOW()
      WHERE id = '${id}';
    `;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${sql.replace(/\n/g, ' ')}"`
    );

    // Обновляем связи с классами
    if (grades && Array.isArray(grades)) {
      // Удаляем старые связи
      const deleteSql = `DELETE FROM subject_grades WHERE subject_id = '${id}';`;
      await execAsync(
        `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${deleteSql}"`
      );

      // Добавляем новые связи
      if (grades.length > 0) {
        const gradesSql = grades.map(g =>
          `INSERT INTO subject_grades (subject_id, grade_number, is_active) VALUES ('${id}', ${g}, TRUE);`
        ).join(' ');

        await execAsync(
          `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${gradesSql}"`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Предмет успешно обновлён',
    });
  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при обновлении предмета',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete subject (soft delete)
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
    const sql = `UPDATE subjects SET is_active = FALSE WHERE id = '${id}';`;

    await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -c "${sql}"`
    );

    return NextResponse.json({
      success: true,
      message: 'Предмет успешно удалён',
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при удалении предмета',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
