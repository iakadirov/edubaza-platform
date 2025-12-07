import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/db-library';

/**
 * GET /api/library/categories
 * Get all library categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeChildren = searchParams.get('includeChildren') !== 'false';

    const categories = await getCategories(includeChildren);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
