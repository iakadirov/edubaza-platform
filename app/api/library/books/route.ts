import { NextRequest, NextResponse } from 'next/server';
import { getBooks, createBook } from '@/lib/db-library';
import { uploadBookPDF, uploadBookCover, generateBookSlug, validatePDFFile, validateCoverImage } from '@/lib/storage-library';
import { verifyToken } from '@/lib/jwt';
import type { GetBooksQuery, CreateBookRequest } from '@/types/library';

/**
 * GET /api/library/books
 * Get books with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: GetBooksQuery = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      subjectId: searchParams.get('subjectId') || undefined,
      gradeNumber: searchParams.get('gradeNumber') ? parseInt(searchParams.get('gradeNumber')!) : undefined,
      bookType: searchParams.get('bookType') as any || undefined,
      accessLevel: searchParams.get('accessLevel') as any || undefined,
      sortBy: searchParams.get('sortBy') as any || 'created_at',
      sortOrder: searchParams.get('sortOrder') as any || 'DESC',
    };

    const result = await getBooks(params);

    return NextResponse.json({
      success: true,
      data: result.books,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch books',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/library/books
 * Create new book (admin only)
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
    // For now, allow any authenticated user

    const formData = await request.formData();

    // Extract files
    const pdfFile = formData.get('pdf') as File | null;
    const coverFile = formData.get('cover') as File | null;

    if (!pdfFile) {
      return NextResponse.json(
        { success: false, error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // Validate PDF
    const pdfValidation = validatePDFFile(pdfFile);
    if (!pdfValidation.valid) {
      return NextResponse.json(
        { success: false, error: pdfValidation.error },
        { status: 400 }
      );
    }

    // Validate cover if provided
    if (coverFile) {
      const coverValidation = validateCoverImage(coverFile);
      if (!coverValidation.valid) {
        return NextResponse.json(
          { success: false, error: coverValidation.error },
          { status: 400 }
        );
      }
    }

    // Extract metadata
    const titleUz = formData.get('titleUz') as string;
    const titleRu = formData.get('titleRu') as string | null;
    const titleEn = formData.get('titleEn') as string | null;
    const descriptionUz = formData.get('descriptionUz') as string | null;
    const descriptionRu = formData.get('descriptionRu') as string | null;
    const descriptionEn = formData.get('descriptionEn') as string | null;
    const bookType = formData.get('bookType') as string || 'BOOK';
    const categoryId = formData.get('categoryId') as string | null;
    const subjectId = formData.get('subjectId') as string | null;
    const gradeNumber = formData.get('gradeNumber') ? parseInt(formData.get('gradeNumber') as string) : null;
    const authors = formData.get('authors') ? JSON.parse(formData.get('authors') as string) : [];
    const publisher = formData.get('publisher') as string | null;
    const publishYear = formData.get('publishYear') ? parseInt(formData.get('publishYear') as string) : null;
    const isbn = formData.get('isbn') as string | null;
    const pageCount = formData.get('pageCount') ? parseInt(formData.get('pageCount') as string) : null;
    const accessLevel = formData.get('accessLevel') as string || 'FREE';
    const keywords = formData.get('keywords') ? JSON.parse(formData.get('keywords') as string) : [];

    if (!titleUz) {
      return NextResponse.json(
        { success: false, error: 'Title (Uzbek) is required' },
        { status: 400 }
      );
    }

    // Create temporary book ID for file uploads
    const tempBookId = crypto.randomUUID();

    // Upload PDF
    const pdfUpload = await uploadBookPDF(pdfFile, tempBookId, pdfFile.name);

    // Upload cover if provided
    let coverUrl: string | null = null;
    if (coverFile) {
      coverUrl = await uploadBookCover(coverFile, tempBookId, coverFile.name);
    }

    // Generate slug
    const slug = generateBookSlug(titleUz, tempBookId);

    // Create book record
    const bookData: CreateBookRequest = {
      titleUz,
      titleRu,
      titleEn,
      descriptionUz,
      descriptionRu,
      descriptionEn,
      bookType: bookType as any,
      categoryId,
      subjectId,
      gradeNumber,
      authors,
      publisher,
      publishYear,
      isbn,
      pdfUrl: pdfUpload.url,
      pdfFilename: pdfUpload.filename,
      pdfSizeBytes: pdfUpload.sizeBytes,
      pageCount,
      coverImageUrl: coverUrl,
      accessLevel: accessLevel as any,
      slug,
      keywords,
    };

    const book = await createBook(bookData, user.id);

    return NextResponse.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create book',
      },
      { status: 500 }
    );
  }
}
