import { NextRequest, NextResponse } from 'next/server';
import { getBookById, updateBook, deleteBook, incrementBookViews } from '@/lib/db-library';
import { deleteBookPDF, deleteBookCover } from '@/lib/storage-library';
import { verifyToken } from '@/lib/jwt';
import type { UpdateBookRequest } from '@/types/library';

/**
 * GET /api/library/books/:id
 * Get book by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const book = await getBookById(params.id);

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          error: 'Book not found',
        },
        { status: 404 }
      );
    }

    // Increment views count (fire and forget)
    incrementBookViews(params.id).catch(console.error);

    return NextResponse.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch book',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/library/books/:id
 * Update book (admin only)
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
    const updateData: UpdateBookRequest = body;

    const updatedBook = await updateBook(params.id, updateData);

    if (!updatedBook) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBook,
    });
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update book',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/library/books/:id
 * Delete book (admin only)
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

    // Get book details before deletion
    const book = await getBookById(params.id);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Soft delete the book record
    const deleted = await deleteBook(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete book' },
        { status: 500 }
      );
    }

    // Delete files from storage (fire and forget - don't block response)
    deleteBookPDF(book.pdfUrl).catch(console.error);
    if (book.coverImageUrl) {
      deleteBookCover(book.coverImageUrl).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete book',
      },
      { status: 500 }
    );
  }
}
