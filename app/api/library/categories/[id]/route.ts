import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/db-library';
import { verifyToken } from '@/lib/jwt';
import type { UpdateCategoryRequest } from '@/types/library';

/**
 * GET /api/library/categories/:id
 * Get category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategoryById(params.id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch category',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/library/categories/:id
 * Update category (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData: UpdateCategoryRequest = body;

    const updatedCategory = await updateCategory(params.id, updateData);

    if (!updatedCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/library/categories/:id
 * Delete category (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const deleted = await deleteCategory(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      },
      { status: 500 }
    );
  }
}
