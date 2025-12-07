import { NextRequest, NextResponse } from 'next/server';
import { trackDownload, getUserDownloads, getBookById } from '@/lib/db-library';
import { getBookDownloadUrl } from '@/lib/storage-library';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/library/downloads
 * Get user's download history
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
    const limit = parseInt(searchParams.get('limit') || '50');

    const downloads = await getUserDownloads(user.id, limit);

    return NextResponse.json({
      success: true,
      data: downloads,
    });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch downloads',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/library/downloads
 * Track download and get signed download URL
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

    // Get book details
    const book = await getBookById(bookId);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // TODO: Check user's subscription level vs book's access level
    // For now, allow all downloads

    // Track the download
    await trackDownload(user.id, bookId);

    // Generate signed download URL (expires in 1 hour)
    const downloadUrl = await getBookDownloadUrl(book.pdfUrl, 3600);

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl,
        filename: book.pdfFilename,
        expiresIn: 3600, // seconds
      },
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process download',
      },
      { status: 500 }
    );
  }
}
