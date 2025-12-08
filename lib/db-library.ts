/**
 * Database helpers for Library Module
 * Built on top of the database connection pool (lib/db.ts)
 */

import { pool } from './db';
import type {
  LibraryCategory,
  LibraryBook,
  LibraryBookmark,
  ReadingProgress,
  LibraryDownload,
  GetBooksQuery,
  PaginatedBooksResponse,
  CreateBookRequest,
  UpdateBookRequest,
} from '@/types/library';

// ============================================
// Category Functions
// ============================================

/**
 * Get all categories (with optional hierarchy)
 * @param includeChildren - Whether to include child categories
 * @returns Array of categories
 */
export async function getCategories(includeChildren: boolean = true): Promise<LibraryCategory[]> {
  const query = `
    SELECT
      id,
      name_uz as "nameUz",
      name_ru as "nameRu",
      name_en as "nameEn",
      slug,
      description_uz as "descriptionUz",
      parent_category_id as "parentCategoryId",
      linked_subject_id as "linkedSubjectId",
      linked_grade as "linkedGrade",
      category_type as "categoryType",
      icon,
      sort_order as "sortOrder",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_categories
    ${!includeChildren ? 'WHERE parent_category_id IS NULL' : ''}
    ORDER BY sort_order ASC, name_uz ASC
  `;

  const result = await pool.query(query);
  return result.rows;
}

/**
 * Get category by ID
 * @param categoryId - Category UUID
 * @returns Category or null
 */
export async function getCategoryById(categoryId: string): Promise<LibraryCategory | null> {
  const query = `
    SELECT
      id,
      name_uz as "nameUz",
      name_ru as "nameRu",
      name_en as "nameEn",
      slug,
      description_uz as "descriptionUz",
      parent_category_id as "parentCategoryId",
      linked_subject_id as "linkedSubjectId",
      linked_grade as "linkedGrade",
      category_type as "categoryType",
      icon,
      sort_order as "sortOrder",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_categories
    WHERE id = $1
  `;

  const result = await pool.query(query, [categoryId]);
  return result.rows[0] || null;
}

/**
 * Get category by slug
 * @param slug - Category slug
 * @returns Category or null
 */
export async function getCategoryBySlug(slug: string): Promise<LibraryCategory | null> {
  const query = `
    SELECT
      id,
      name_uz as "nameUz",
      name_ru as "nameRu",
      name_en as "nameEn",
      slug,
      description_uz as "descriptionUz",
      parent_category_id as "parentCategoryId",
      linked_subject_id as "linkedSubjectId",
      linked_grade as "linkedGrade",
      category_type as "categoryType",
      icon,
      sort_order as "sortOrder",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_categories
    WHERE slug = $1
  `;

  const result = await pool.query(query, [slug]);
  return result.rows[0] || null;
}

/**
 * Create a new category
 * @param data - Category creation data
 * @returns Created category
 */
export async function createCategory(data: CreateCategoryRequest): Promise<LibraryCategory> {
  const query = `
    INSERT INTO library_categories (
      name_uz,
      name_ru,
      name_en,
      slug,
      description_uz,
      parent_category_id,
      linked_subject_id,
      linked_grade,
      category_type,
      icon,
      sort_order
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING
      id,
      name_uz as "nameUz",
      name_ru as "nameRu",
      name_en as "nameEn",
      slug,
      description_uz as "descriptionUz",
      parent_category_id as "parentCategoryId",
      linked_subject_id as "linkedSubjectId",
      linked_grade as "linkedGrade",
      category_type as "categoryType",
      icon,
      sort_order as "sortOrder",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const values = [
    data.nameUz,
    data.nameRu || null,
    data.nameEn || null,
    data.slug,
    data.descriptionUz || null,
    data.parentCategoryId || null,
    data.linkedSubjectId || null,
    data.linkedGrade || null,
    data.categoryType,
    data.icon || null,
    data.sortOrder || 0,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Update a category
 * @param categoryId - Category UUID
 * @param data - Update data
 * @returns Updated category or null
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryRequest
): Promise<LibraryCategory | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.nameUz !== undefined) {
    fields.push(`name_uz = $${paramIndex++}`);
    values.push(data.nameUz);
  }
  if (data.nameRu !== undefined) {
    fields.push(`name_ru = $${paramIndex++}`);
    values.push(data.nameRu);
  }
  if (data.nameEn !== undefined) {
    fields.push(`name_en = $${paramIndex++}`);
    values.push(data.nameEn);
  }
  if (data.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(data.slug);
  }
  if (data.descriptionUz !== undefined) {
    fields.push(`description_uz = $${paramIndex++}`);
    values.push(data.descriptionUz);
  }
  if (data.parentCategoryId !== undefined) {
    fields.push(`parent_category_id = $${paramIndex++}`);
    values.push(data.parentCategoryId);
  }
  if (data.linkedSubjectId !== undefined) {
    fields.push(`linked_subject_id = $${paramIndex++}`);
    values.push(data.linkedSubjectId);
  }
  if (data.linkedGrade !== undefined) {
    fields.push(`linked_grade = $${paramIndex++}`);
    values.push(data.linkedGrade);
  }
  if (data.categoryType !== undefined) {
    fields.push(`category_type = $${paramIndex++}`);
    values.push(data.categoryType);
  }
  if (data.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`);
    values.push(data.icon);
  }
  if (data.sortOrder !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`);
    values.push(data.sortOrder);
  }

  if (fields.length === 0) {
    return getCategoryById(categoryId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(categoryId);

  const query = `
    UPDATE library_categories
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING
      id,
      name_uz as "nameUz",
      name_ru as "nameRu",
      name_en as "nameEn",
      slug,
      description_uz as "descriptionUz",
      parent_category_id as "parentCategoryId",
      linked_subject_id as "linkedSubjectId",
      linked_grade as "linkedGrade",
      category_type as "categoryType",
      icon,
      sort_order as "sortOrder",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete a category
 * @param categoryId - Category UUID
 * @returns Success status
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  const query = 'DELETE FROM library_categories WHERE id = $1';
  const result = await pool.query(query, [categoryId]);
  return result.rowCount !== null && result.rowCount > 0;
}

// ============================================
// Book Functions
// ============================================

/**
 * Get books with filtering and pagination
 * @param params - Query parameters
 * @returns Paginated books response
 */
export async function getBooks(params: GetBooksQuery): Promise<PaginatedBooksResponse> {
  const {
    page = 1,
    limit = 20,
    search,
    categoryId,
    subjectId,
    gradeNumber,
    bookType,
    accessLevel,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = params;

  const offset = (page - 1) * limit;
  const queryParams: any[] = [];
  let paramIndex = 1;

  // Build WHERE conditions
  const conditions: string[] = ['is_active = true'];

  if (search) {
    conditions.push(`(
      title_uz ILIKE $${paramIndex} OR
      title_ru ILIKE $${paramIndex} OR
      title_en ILIKE $${paramIndex} OR
      description_uz ILIKE $${paramIndex} OR
      description_ru ILIKE $${paramIndex}
    )`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (categoryId) {
    conditions.push(`category_id = $${paramIndex}`);
    queryParams.push(categoryId);
    paramIndex++;
  }

  if (subjectId) {
    conditions.push(`subject_id = $${paramIndex}`);
    queryParams.push(subjectId);
    paramIndex++;
  }

  if (gradeNumber) {
    conditions.push(`grade_number = $${paramIndex}`);
    queryParams.push(gradeNumber);
    paramIndex++;
  }

  if (bookType) {
    conditions.push(`book_type = $${paramIndex}`);
    queryParams.push(bookType);
    paramIndex++;
  }

  if (accessLevel) {
    conditions.push(`access_level = $${paramIndex}`);
    queryParams.push(accessLevel);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column
  const allowedSortColumns = ['created_at', 'title_uz', 'views_count', 'downloads_count'];
  const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM library_books
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].total);

  // Get books
  const booksQuery = `
    SELECT
      id,
      title_uz as "titleUz",
      title_ru as "titleRu",
      title_en as "titleEn",
      description_uz as "descriptionUz",
      description_ru as "descriptionRu",
      description_en as "descriptionEn",
      book_type as "bookType",
      category_id as "categoryId",
      subject_id as "subjectId",
      grade_number as "gradeNumber",
      authors,
      publisher,
      publish_year as "publishYear",
      isbn,
      pdf_url as "pdfUrl",
      pdf_filename as "pdfFilename",
      pdf_size_bytes as "pdfSizeBytes",
      page_count as "pageCount",
      cover_image_url as "coverImageUrl",
      access_level as "accessLevel",
      views_count as "viewsCount",
      downloads_count as "downloadsCount",
      bookmarks_count as "bookmarksCount",
      slug,
      keywords,
      is_active as "isActive",
      uploaded_by as "uploadedBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_books
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  queryParams.push(limit, offset);
  const booksResult = await pool.query(booksQuery, queryParams);

  return {
    books: booksResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get book by ID
 * @param bookId - Book UUID
 * @returns Book or null
 */
export async function getBookById(bookId: string): Promise<LibraryBook | null> {
  const query = `
    SELECT
      id,
      title_uz as "titleUz",
      title_ru as "titleRu",
      title_en as "titleEn",
      description_uz as "descriptionUz",
      description_ru as "descriptionRu",
      description_en as "descriptionEn",
      book_type as "bookType",
      category_id as "categoryId",
      subject_id as "subjectId",
      grade_number as "gradeNumber",
      authors,
      publisher,
      publish_year as "publishYear",
      isbn,
      pdf_url as "pdfUrl",
      pdf_filename as "pdfFilename",
      pdf_size_bytes as "pdfSizeBytes",
      page_count as "pageCount",
      cover_image_url as "coverImageUrl",
      access_level as "accessLevel",
      views_count as "viewsCount",
      downloads_count as "downloadsCount",
      bookmarks_count as "bookmarksCount",
      slug,
      keywords,
      is_active as "isActive",
      uploaded_by as "uploadedBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_books
    WHERE id = $1 AND is_active = true
  `;

  const result = await pool.query(query, [bookId]);
  return result.rows[0] || null;
}

/**
 * Get book by slug
 * @param slug - Book slug
 * @returns Book or null
 */
export async function getBookBySlug(slug: string): Promise<LibraryBook | null> {
  const query = `
    SELECT
      id,
      title_uz as "titleUz",
      title_ru as "titleRu",
      title_en as "titleEn",
      description_uz as "descriptionUz",
      description_ru as "descriptionRu",
      description_en as "descriptionEn",
      book_type as "bookType",
      category_id as "categoryId",
      subject_id as "subjectId",
      grade_number as "gradeNumber",
      authors,
      publisher,
      publish_year as "publishYear",
      isbn,
      pdf_url as "pdfUrl",
      pdf_filename as "pdfFilename",
      pdf_size_bytes as "pdfSizeBytes",
      page_count as "pageCount",
      cover_image_url as "coverImageUrl",
      access_level as "accessLevel",
      views_count as "viewsCount",
      downloads_count as "downloadsCount",
      bookmarks_count as "bookmarksCount",
      slug,
      keywords,
      is_active as "isActive",
      uploaded_by as "uploadedBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_books
    WHERE slug = $1 AND is_active = true
  `;

  const result = await pool.query(query, [slug]);
  return result.rows[0] || null;
}

/**
 * Create new book
 * @param data - Book creation data
 * @param uploadedBy - User ID who uploaded the book
 * @returns Created book
 */
export async function createBook(data: CreateBookRequest, uploadedBy: string): Promise<LibraryBook> {
  const query = `
    INSERT INTO library_books (
      title_uz, title_ru, title_en,
      description_uz, description_ru, description_en,
      book_type, category_id, subject_id, grade_number,
      authors, publisher, publish_year, isbn,
      pdf_url, pdf_filename, pdf_size_bytes, page_count, cover_image_url,
      access_level, slug, keywords, uploaded_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23
    )
    RETURNING
      id,
      title_uz as "titleUz",
      title_ru as "titleRu",
      title_en as "titleEn",
      description_uz as "descriptionUz",
      description_ru as "descriptionRu",
      description_en as "descriptionEn",
      book_type as "bookType",
      category_id as "categoryId",
      subject_id as "subjectId",
      grade_number as "gradeNumber",
      authors,
      publisher,
      publish_year as "publishYear",
      isbn,
      pdf_url as "pdfUrl",
      pdf_filename as "pdfFilename",
      pdf_size_bytes as "pdfSizeBytes",
      page_count as "pageCount",
      cover_image_url as "coverImageUrl",
      access_level as "accessLevel",
      views_count as "viewsCount",
      downloads_count as "downloadsCount",
      bookmarks_count as "bookmarksCount",
      slug,
      keywords,
      is_active as "isActive",
      uploaded_by as "uploadedBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const result = await pool.query(query, [
    data.titleUz,
    data.titleRu || null,
    data.titleEn || null,
    data.descriptionUz || null,
    data.descriptionRu || null,
    data.descriptionEn || null,
    data.bookType,
    data.categoryId || null,
    data.subjectId || null,
    data.gradeNumber || null,
    data.authors || [],
    data.publisher || null,
    data.publishYear || null,
    data.isbn || null,
    data.pdfUrl,
    data.pdfFilename,
    data.pdfSizeBytes,
    data.pageCount || null,
    data.coverImageUrl || null,
    data.accessLevel,
    data.slug,
    data.keywords || [],
    uploadedBy,
  ]);

  return result.rows[0];
}

/**
 * Update book
 * @param bookId - Book UUID
 * @param data - Book update data
 * @returns Updated book or null
 */
export async function updateBook(bookId: string, data: UpdateBookRequest): Promise<LibraryBook | null> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Build dynamic update query
  if (data.titleUz !== undefined) {
    updates.push(`title_uz = $${paramIndex++}`);
    values.push(data.titleUz);
  }
  if (data.titleRu !== undefined) {
    updates.push(`title_ru = $${paramIndex++}`);
    values.push(data.titleRu);
  }
  if (data.titleEn !== undefined) {
    updates.push(`title_en = $${paramIndex++}`);
    values.push(data.titleEn);
  }
  if (data.descriptionUz !== undefined) {
    updates.push(`description_uz = $${paramIndex++}`);
    values.push(data.descriptionUz);
  }
  if (data.descriptionRu !== undefined) {
    updates.push(`description_ru = $${paramIndex++}`);
    values.push(data.descriptionRu);
  }
  if (data.descriptionEn !== undefined) {
    updates.push(`description_en = $${paramIndex++}`);
    values.push(data.descriptionEn);
  }
  if (data.bookType !== undefined) {
    updates.push(`book_type = $${paramIndex++}`);
    values.push(data.bookType);
  }
  if (data.categoryId !== undefined) {
    updates.push(`category_id = $${paramIndex++}`);
    values.push(data.categoryId);
  }
  if (data.subjectId !== undefined) {
    updates.push(`subject_id = $${paramIndex++}`);
    values.push(data.subjectId);
  }
  if (data.gradeNumber !== undefined) {
    updates.push(`grade_number = $${paramIndex++}`);
    values.push(data.gradeNumber);
  }
  if (data.authors !== undefined) {
    updates.push(`authors = $${paramIndex++}`);
    values.push(data.authors);
  }
  if (data.publisher !== undefined) {
    updates.push(`publisher = $${paramIndex++}`);
    values.push(data.publisher);
  }
  if (data.publishYear !== undefined) {
    updates.push(`publish_year = $${paramIndex++}`);
    values.push(data.publishYear);
  }
  if (data.isbn !== undefined) {
    updates.push(`isbn = $${paramIndex++}`);
    values.push(data.isbn);
  }
  if (data.pageCount !== undefined) {
    updates.push(`page_count = $${paramIndex++}`);
    values.push(data.pageCount);
  }
  if (data.coverImageUrl !== undefined) {
    updates.push(`cover_image_url = $${paramIndex++}`);
    values.push(data.coverImageUrl);
  }
  if (data.accessLevel !== undefined) {
    updates.push(`access_level = $${paramIndex++}`);
    values.push(data.accessLevel);
  }
  if (data.keywords !== undefined) {
    updates.push(`keywords = $${paramIndex++}`);
    values.push(data.keywords);
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    values.push(data.isActive);
  }

  if (updates.length === 0) {
    return getBookById(bookId);
  }

  values.push(bookId);

  const query = `
    UPDATE library_books
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING
      id,
      title_uz as "titleUz",
      title_ru as "titleRu",
      title_en as "titleEn",
      description_uz as "descriptionUz",
      description_ru as "descriptionRu",
      description_en as "descriptionEn",
      book_type as "bookType",
      category_id as "categoryId",
      subject_id as "subjectId",
      grade_number as "gradeNumber",
      authors,
      publisher,
      publish_year as "publishYear",
      isbn,
      pdf_url as "pdfUrl",
      pdf_filename as "pdfFilename",
      pdf_size_bytes as "pdfSizeBytes",
      page_count as "pageCount",
      cover_image_url as "coverImageUrl",
      access_level as "accessLevel",
      views_count as "viewsCount",
      downloads_count as "downloadsCount",
      bookmarks_count as "bookmarksCount",
      slug,
      keywords,
      is_active as "isActive",
      uploaded_by as "uploadedBy",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete book (soft delete)
 * @param bookId - Book UUID
 * @returns Success status
 */
export async function deleteBook(bookId: string): Promise<boolean> {
  const query = `
    UPDATE library_books
    SET is_active = false
    WHERE id = $1
  `;

  const result = await pool.query(query, [bookId]);
  return result.rowCount > 0;
}

/**
 * Increment book views count
 * @param bookId - Book UUID
 */
export async function incrementBookViews(bookId: string): Promise<void> {
  const query = `
    UPDATE library_books
    SET views_count = views_count + 1
    WHERE id = $1
  `;

  await pool.query(query, [bookId]);
}

/**
 * Increment book downloads count
 * @param bookId - Book UUID
 */
export async function incrementBookDownloads(bookId: string): Promise<void> {
  const query = `
    UPDATE library_books
    SET downloads_count = downloads_count + 1
    WHERE id = $1
  `;

  await pool.query(query, [bookId]);
}

// ============================================
// Bookmark Functions
// ============================================

/**
 * Get user bookmarks
 * @param userId - User ID
 * @returns Array of bookmarks with book details
 */
export async function getUserBookmarks(userId: string): Promise<(LibraryBookmark & { book: LibraryBook })[]> {
  const query = `
    SELECT
      bm.id,
      bm.user_id as "userId",
      bm.book_id as "bookId",
      bm.created_at as "createdAt",
      json_build_object(
        'id', b.id,
        'titleUz', b.title_uz,
        'titleRu', b.title_ru,
        'titleEn', b.title_en,
        'coverImageUrl', b.cover_image_url,
        'slug', b.slug,
        'authors', b.authors,
        'accessLevel', b.access_level
      ) as book
    FROM library_bookmarks bm
    JOIN library_books b ON bm.book_id = b.id
    WHERE bm.user_id = $1 AND b.is_active = true
    ORDER BY bm.created_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Check if user has bookmarked a book
 * @param userId - User ID
 * @param bookId - Book UUID
 * @returns Boolean
 */
export async function isBookmarked(userId: string, bookId: string): Promise<boolean> {
  const query = `
    SELECT EXISTS (
      SELECT 1 FROM library_bookmarks
      WHERE user_id = $1 AND book_id = $2
    ) as exists
  `;

  const result = await pool.query(query, [userId, bookId]);
  return result.rows[0].exists;
}

/**
 * Toggle bookmark (add if doesn't exist, remove if exists)
 * @param userId - User ID
 * @param bookId - Book UUID
 * @returns New bookmark state (true = bookmarked, false = removed)
 */
export async function toggleBookmark(userId: string, bookId: string): Promise<boolean> {
  const exists = await isBookmarked(userId, bookId);

  if (exists) {
    // Remove bookmark
    await pool.query(
      'DELETE FROM library_bookmarks WHERE user_id = $1 AND book_id = $2',
      [userId, bookId]
    );
    // Decrement counter
    await pool.query(
      'UPDATE library_books SET bookmarks_count = bookmarks_count - 1 WHERE id = $1',
      [bookId]
    );
    return false;
  } else {
    // Add bookmark
    await pool.query(
      'INSERT INTO library_bookmarks (user_id, book_id) VALUES ($1, $2)',
      [userId, bookId]
    );
    // Increment counter
    await pool.query(
      'UPDATE library_books SET bookmarks_count = bookmarks_count + 1 WHERE id = $1',
      [bookId]
    );
    return true;
  }
}

// ============================================
// Reading Progress Functions
// ============================================

/**
 * Get user reading progress for a book
 * @param userId - User ID
 * @param bookId - Book UUID
 * @returns Reading progress or null
 */
export async function getReadingProgress(userId: string, bookId: string): Promise<ReadingProgress | null> {
  const query = `
    SELECT
      id,
      user_id as "userId",
      book_id as "bookId",
      current_page as "currentPage",
      total_pages as "totalPages",
      progress_percentage as "progressPercentage",
      last_read_at as "lastReadAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM library_reading_progress
    WHERE user_id = $1 AND book_id = $2
  `;

  const result = await pool.query(query, [userId, bookId]);
  return result.rows[0] || null;
}

/**
 * Update reading progress
 * @param userId - User ID
 * @param bookId - Book UUID
 * @param currentPage - Current page number
 * @param totalPages - Total pages in book
 * @returns Updated progress
 */
export async function updateReadingProgress(
  userId: string,
  bookId: string,
  currentPage: number,
  totalPages: number
): Promise<ReadingProgress> {
  const progressPercentage = ((currentPage / totalPages) * 100).toFixed(2);

  const query = `
    INSERT INTO library_reading_progress (
      user_id, book_id, current_page, total_pages, progress_percentage, last_read_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id, book_id)
    DO UPDATE SET
      current_page = $3,
      total_pages = $4,
      progress_percentage = $5,
      last_read_at = NOW()
    RETURNING
      id,
      user_id as "userId",
      book_id as "bookId",
      current_page as "currentPage",
      total_pages as "totalPages",
      progress_percentage as "progressPercentage",
      last_read_at as "lastReadAt",
      created_at as "createdAt",
      updated_at as "updatedAt"
  `;

  const result = await pool.query(query, [userId, bookId, currentPage, totalPages, progressPercentage]);
  return result.rows[0];
}

/**
 * Get user's recently read books
 * @param userId - User ID
 * @param limit - Number of books to return
 * @returns Array of progress with book details
 */
export async function getRecentlyReadBooks(
  userId: string,
  limit: number = 10
): Promise<(ReadingProgress & { book: LibraryBook })[]> {
  const query = `
    SELECT
      rp.id,
      rp.user_id as "userId",
      rp.book_id as "bookId",
      rp.current_page as "currentPage",
      rp.total_pages as "totalPages",
      rp.progress_percentage as "progressPercentage",
      rp.last_read_at as "lastReadAt",
      json_build_object(
        'id', b.id,
        'titleUz', b.title_uz,
        'titleRu', b.title_ru,
        'titleEn', b.title_en,
        'coverImageUrl', b.cover_image_url,
        'slug', b.slug,
        'authors', b.authors
      ) as book
    FROM library_reading_progress rp
    JOIN library_books b ON rp.book_id = b.id
    WHERE rp.user_id = $1 AND b.is_active = true
    ORDER BY rp.last_read_at DESC
    LIMIT $2
  `;

  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}

// ============================================
// Download Tracking Functions
// ============================================

/**
 * Track book download
 * @param userId - User ID
 * @param bookId - Book UUID
 * @returns Download record
 */
export async function trackDownload(userId: string, bookId: string): Promise<LibraryDownload> {
  const query = `
    INSERT INTO library_downloads (user_id, book_id)
    VALUES ($1, $2)
    RETURNING
      id,
      user_id as "userId",
      book_id as "bookId",
      downloaded_at as "downloadedAt"
  `;

  const result = await pool.query(query, [userId, bookId]);

  // Also increment download counter
  await incrementBookDownloads(bookId);

  return result.rows[0];
}

/**
 * Get user's download history
 * @param userId - User ID
 * @param limit - Number of records to return
 * @returns Array of downloads with book details
 */
export async function getUserDownloads(
  userId: string,
  limit: number = 50
): Promise<(LibraryDownload & { book: LibraryBook })[]> {
  const query = `
    SELECT
      d.id,
      d.user_id as "userId",
      d.book_id as "bookId",
      d.downloaded_at as "downloadedAt",
      json_build_object(
        'id', b.id,
        'titleUz', b.title_uz,
        'coverImageUrl', b.cover_image_url,
        'slug', b.slug
      ) as book
    FROM library_downloads d
    JOIN library_books b ON d.book_id = b.id
    WHERE d.user_id = $1 AND b.is_active = true
    ORDER BY d.downloaded_at DESC
    LIMIT $2
  `;

  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}
