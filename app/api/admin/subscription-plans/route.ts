import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { findUserByPhone } from '@/lib/db-users';
import { executeSql } from '@/lib/db-helper';

// Helper function to execute SQL queries
async function executeQuery(sql: string): Promise<any> {
  const stdout = await executeSql(sql, { fieldSeparator: '|' });
  return stdout.trim();
}

// GET - Fetch all subscription plans
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await findUserByPhone(payload.phone);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sql = `SELECT id, plan_code, name_uz, name_ru, price_uzs, features, limits,
                        display_order, is_active, show_watermark, created_at, updated_at
                 FROM subscription_plans
                 ORDER BY display_order ASC;`;

    const result = await executeQuery(sql);
    const lines = result.split('\n').filter((line: string) => line.trim());

    const plans = lines.map((line: string) => {
      const parts = line.split('|');
      return {
        id: parts[0],
        planCode: parts[1],
        nameUz: parts[2],
        nameRu: parts[3],
        priceUzs: parseInt(parts[4]),
        features: JSON.parse(parts[5] || '{}'),
        limits: JSON.parse(parts[6] || '{}'),
        displayOrder: parseInt(parts[7]),
        isActive: parts[8] === 't',
        showWatermark: parts[9] === 't',
        createdAt: parts[10],
        updatedAt: parts[11],
      };
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST - Create new subscription plan
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await findUserByPhone(payload.phone);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { planCode, nameUz, nameRu, priceUzs, features, limits, displayOrder, isActive, showWatermark } = body;

    const escapedPlanCode = planCode.replace(/'/g, "''");
    const escapedNameUz = nameUz.replace(/'/g, "''");
    const escapedNameRu = (nameRu || '').replace(/'/g, "''");
    const escapedFeatures = JSON.stringify(features).replace(/'/g, "''");
    const escapedLimits = JSON.stringify(limits).replace(/'/g, "''");

    const sql = `INSERT INTO subscription_plans
                 (plan_code, name_uz, name_ru, price_uzs, features, limits, display_order, is_active, show_watermark)
                 VALUES ('${escapedPlanCode}', '${escapedNameUz}', '${escapedNameRu}', ${priceUzs},
                         '${escapedFeatures}'::jsonb, '${escapedLimits}'::jsonb,
                         ${displayOrder || 0}, ${isActive !== false}, ${showWatermark !== false})
                 RETURNING id;`;

    const result = await executeQuery(sql);

    return NextResponse.json({ success: true, id: result.trim() });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

// PUT - Update subscription plan
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await findUserByPhone(payload.phone);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, nameUz, nameRu, priceUzs, features, limits, displayOrder, isActive, showWatermark } = body;

    const escapedId = id.replace(/'/g, "''");
    const escapedNameUz = nameUz.replace(/'/g, "''");
    const escapedNameRu = (nameRu || '').replace(/'/g, "''");
    const escapedFeatures = JSON.stringify(features).replace(/'/g, "''");
    const escapedLimits = JSON.stringify(limits).replace(/'/g, "''");

    const sql = `UPDATE subscription_plans
                 SET name_uz = '${escapedNameUz}',
                     name_ru = '${escapedNameRu}',
                     price_uzs = ${priceUzs},
                     features = '${escapedFeatures}'::jsonb,
                     limits = '${escapedLimits}'::jsonb,
                     display_order = ${displayOrder},
                     is_active = ${isActive},
                     show_watermark = ${showWatermark},
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = '${escapedId}';`;

    await executeQuery(sql);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
