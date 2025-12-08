import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db-library';
import { verifyToken } from '@/lib/jwt';
import type { CreateCategoryRequest } from '@/types/library';

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

/**
 * POST /api/library/categories
 * Create a new category (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // TODO: Add role check for admin/teacher

    const body = await request.json();
    const categoryData: CreateCategoryRequest = body;

    const category = await createCategory(categoryData);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category',
      },
      { status: 500 }
    );
  }
}
