import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { executeSql } from '@/lib/db-helper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade'); // Опциональный фильтр по классу
    const categoryId = searchParams.get('categoryId'); // Опциональный фильтр по категории

    let sql: string;

    if (grade) {
      // Получаем предметы для конкретного класса
      sql = `
        SELECT DISTINCT s.id, s.code, s.name_uz, s.description_uz,
               s.icon, s.logo, s.banner, s.color, s.sort_order
        FROM subjects s
        JOIN subject_grades sg ON s.id = sg.subject_id
        ${categoryId ? `JOIN subject_category_relations scr ON s.id = scr.subject_id` : ''}
        WHERE sg.grade_number = ${parseInt(grade)}
          AND sg.is_active = TRUE
          AND s.is_active = TRUE
          ${categoryId ? `AND scr.category_id = '${categoryId}'` : ''}
        ORDER BY s.sort_order;
      `;
    } else {
      // Получаем все предметы
      sql = `
        SELECT s.id, s.code, s.name_uz, s.description_uz,
               s.icon, s.logo, s.banner, s.color, s.sort_order
        FROM subjects s
        ${categoryId ? `JOIN subject_category_relations scr ON s.id = scr.subject_id` : ''}
        WHERE s.is_active = TRUE
          ${categoryId ? `AND scr.category_id = '${categoryId}'` : ''}
        ORDER BY s.sort_order;
      `;
    }

    const stdout = await executeSql(sql.replace(/\n/g, ' '), { fieldSeparator: '|' });

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
        logo: parts[5] || null,
        banner: parts[6] || null,
        color: parts[7] || null,
        sortOrder: parseInt(parts[8] || '0'),
      };
    });

    // Получаем все классы одним запросом
    const allSubjectIds = subjects.map(s => s.id).join("','");
    const gradesSql = `
      SELECT subject_id, grade_number
      FROM subject_grades
      WHERE subject_id IN ('${allSubjectIds}') AND is_active = TRUE
      ORDER BY subject_id, grade_number;
    `;

    const gradesStdout = await executeSql(gradesSql.replace(/\n/g, ' '), { fieldSeparator: '|' });

    // Группируем классы по subject_id
    const gradesMap = new Map<string, number[]>();
    if (gradesStdout && gradesStdout.trim()) {
      const gradeLines = gradesStdout.trim().split('\n').filter(line => line.trim());
      gradeLines.forEach(line => {
        const [subjectId, gradeNumber] = line.split('|');
        if (!gradesMap.has(subjectId)) {
          gradesMap.set(subjectId, []);
        }
        gradesMap.get(subjectId)!.push(parseInt(gradeNumber));
      });
    }

    // Получаем все категории одним запросом
    const categoriesSql = `
      SELECT scr.subject_id, sc.id, sc.code, sc.name_uz
      FROM subject_categories sc
      JOIN subject_category_relations scr ON sc.id = scr.category_id
      WHERE scr.subject_id IN ('${allSubjectIds}') AND sc.is_active = TRUE
      ORDER BY scr.subject_id, sc.sort_order;
    `;

    const categoriesStdout = await executeSql(categoriesSql.replace(/\n/g, ' '), { fieldSeparator: '|' });

    // Группируем категории по subject_id
    const categoriesMap = new Map<string, Array<{ id: string; code: string; nameUz: string }>>();
    if (categoriesStdout && categoriesStdout.trim()) {
      const categoryLines = categoriesStdout.trim().split('\n').filter(line => line.trim());
      categoryLines.forEach(line => {
        const [subjectId, id, code, nameUz] = line.split('|');
        if (!categoriesMap.has(subjectId)) {
          categoriesMap.set(subjectId, []);
        }
        categoriesMap.get(subjectId)!.push({ id, code, nameUz });
      });
    }

    // Присваиваем классы и категории каждому предмету
    subjects.forEach(subject => {
      (subject as any).grades = gradesMap.get(subject.id) || [];
      (subject as any).categories = categoriesMap.get(subject.id) || [];
    });

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
    const { code, nameUz, descriptionUz, icon, logo, banner, color, sortOrder, grades, categoryIds } = body;

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
    const logoEsc = logo ? logo.replace(/'/g, "''") : '';
    const bannerEsc = banner ? banner.replace(/'/g, "''") : '';
    const colorEsc = color ? color.replace(/'/g, "''") : '#3B82F6';
    const sort = sortOrder || 0;

    const sql = `
      INSERT INTO subjects (code, name_uz, description_uz, icon, logo, banner, color, sort_order, is_active)
      VALUES ('${codeEsc}', '${nameUzEsc}', '${descUzEsc}', '${iconEsc}', ${logoEsc ? `'${logoEsc}'` : 'NULL'}, ${bannerEsc ? `'${bannerEsc}'` : 'NULL'}, '${colorEsc}', ${sort}, TRUE)
      RETURNING id;
    `;

    const stdout = await executeSql(sql.replace(/\n/g, ' '));

    const subjectId = stdout.trim().split('\n')[0];

    // Если указаны классы, добавляем связи
    if (grades && Array.isArray(grades) && grades.length > 0) {
      const gradesSql = grades.map(g =>
        `INSERT INTO subject_grades (subject_id, grade_number, is_active) VALUES ('${subjectId}', ${g}, TRUE);`
      ).join(' ');

      await executeSql(gradesSql);
    }

    // Если указаны категории, добавляем связи
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      const categoriesSql = categoryIds.map(catId =>
        `INSERT INTO subject_category_relations (subject_id, category_id) VALUES ('${subjectId}', '${catId}');`
      ).join(' ');

      await executeSql(categoriesSql);
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
    const { id, code, nameUz, descriptionUz, icon, logo, banner, color, sortOrder, grades, categoryIds } = body;

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
    const logoEsc = logo ? logo.replace(/'/g, "''") : '';
    const bannerEsc = banner ? banner.replace(/'/g, "''") : '';
    const colorEsc = color ? color.replace(/'/g, "''") : '#3B82F6';

    const sql = `
      UPDATE subjects
      SET code = '${codeEsc}',
          name_uz = '${nameUzEsc}',
          description_uz = '${descUzEsc}',
          icon = '${iconEsc}',
          logo = ${logoEsc ? `'${logoEsc}'` : 'NULL'},
          banner = ${bannerEsc ? `'${bannerEsc}'` : 'NULL'},
          color = '${colorEsc}',
          sort_order = ${sortOrder || 0},
          updated_at = NOW()
      WHERE id = '${id}';
    `;

    await executeSql(sql.replace(/\n/g, ' '));

    // Обновляем связи с классами
    if (grades && Array.isArray(grades)) {
      // Удаляем старые связи
      const deleteSql = `DELETE FROM subject_grades WHERE subject_id = '${id}';`;
      await executeSql(deleteSql);

      // Добавляем новые связи
      if (grades.length > 0) {
        const gradesSql = grades.map(g =>
          `INSERT INTO subject_grades (subject_id, grade_number, is_active) VALUES ('${id}', ${g}, TRUE);`
        ).join(' ');

        await executeSql(gradesSql);
      }
    }

    // Обновляем связи с категориями
    if (categoryIds && Array.isArray(categoryIds)) {
      // Удаляем старые связи
      const deleteCatSql = `DELETE FROM subject_category_relations WHERE subject_id = '${id}';`;
      await executeSql(deleteCatSql);

      // Добавляем новые связи
      if (categoryIds.length > 0) {
        const categoriesSql = categoryIds.map(catId =>
          `INSERT INTO subject_category_relations (subject_id, category_id) VALUES ('${id}', '${catId}');`
        ).join(' ');

        await executeSql(categoriesSql);
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

    await executeSql(sql);

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
