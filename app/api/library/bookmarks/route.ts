import { NextRequest, NextResponse } from 'next/server';
import { getUserBookmarks, toggleBookmark } from '@/lib/db-library';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/library/bookmarks
 * Get user's bookmarks
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

    const bookmarks = await getUserBookmarks(user.id);

    return NextResponse.json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookmarks',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/library/bookmarks
 * Toggle bookmark for a book
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
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { success: false, error: 'Book ID is required' },
        { status: 400 }
      );
    }

    const isBookmarked = await toggleBookmark(user.id, bookId);

    return NextResponse.json({
      success: true,
      data: {
        bookmarked: isBookmarked,
        message: isBookmarked ? 'Book bookmarked' : 'Bookmark removed',
      },
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle bookmark',
      },
      { status: 500 }
    );
  }
}
