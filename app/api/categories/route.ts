import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const sql = `
      SELECT
        id,
        code,
        name_uz,
        name_ru,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM subject_categories
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, name_uz ASC;
    `;

    const { stdout } = await execAsync(
      `docker exec edubaza_postgres psql -U edubaza -d edubaza -t -A -F"|" -c "${sql.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`
    );

    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const categories = lines.map(line => {
      const [id, code, nameUz, nameRu, sortOrder, isActive, createdAt, updatedAt] = line.split('|');
      return {
        id,
        code,
        nameUz,
        nameRu,
        sortOrder: parseInt(sortOrder),
        isActive: isActive === 't',
        createdAt,
        updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Ошибка при получении категорий',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
