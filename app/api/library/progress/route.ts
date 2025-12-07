import { NextRequest, NextResponse } from 'next/server';
import { getReadingProgress, updateReadingProgress, getRecentlyReadBooks } from '@/lib/db-library';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/library/progress
 * Get user's reading progress or recently read books
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const recent = searchParams.get('recent') === 'true';

    if (recent) {
      // Get recently read books
      const limit = parseInt(searchParams.get('limit') || '10');
      const recentBooks = await getRecentlyReadBooks(user.id, limit);

      return NextResponse.json({
        success: true,
        data: recentBooks,
      });
    }

    if (!bookId) {
      return NextResponse.json(
        { success: false, error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Get progress for specific book
    const progress = await getReadingProgress(user.id, bookId);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reading progress',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/library/progress
 * Update reading progress for a book
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

    const body = await request.json();
    const { bookId, currentPage, totalPages } = body;

    if (!bookId || !currentPage || !totalPages) {
      return NextResponse.json(
        { success: false, error: 'Book ID, current page, and total pages are required' },
        { status: 400 }
      );
    }

    if (currentPage < 1 || currentPage > totalPages) {
      return NextResponse.json(
        { success: false, error: 'Invalid page number' },
        { status: 400 }
      );
    }

    const progress = await updateReadingProgress(user.id, bookId, currentPage, totalPages);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update reading progress',
      },
      { status: 500 }
    );
  }
}
