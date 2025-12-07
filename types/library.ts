// ============================================
// Library Module - TypeScript Types
// ============================================

// Enums matching PostgreSQL database enums

export type BookType = 'BOOK' | 'JOURNAL' | 'MAGAZINE' | 'WORKBOOK' | 'REFERENCE';

export type BookAccess = 'FREE' | 'PRO' | 'SCHOOL';

export type LibraryCategoryType =
  | 'GOVERNMENT_TEXTBOOK'
  | 'SUPPLEMENTARY'
  | 'FICTION'
  | 'REFERENCE'
  | 'MAGAZINE'
  | 'OTHER';

// ============================================
// Main Interfaces
// ============================================

/**
 * Library Category
 * Hierarchical structure for organizing books
 */
export interface LibraryCategory {
  id: string;
  nameUz: string;
  nameRu: string | null;
  nameEn: string | null;
  slug: string;
  descriptionUz: string | null;

  // Hierarchy
  parentCategoryId: string | null;

  // Optional linking to subjects and grades
  linkedSubjectId: string | null; // UUID reference to subjects table
  linkedGrade: number | null; // 1-11

  // Category type
  categoryType: LibraryCategoryType;

  // UI
  icon: string | null;
  sortOrder: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations (populated when needed)
  subcategories?: LibraryCategory[];
  parentCategory?: LibraryCategory;
  booksCount?: number;
}

/**
 * Library Book
 * Main book entity with metadata and access control
 */
export interface LibraryBook {
  id: string;

  // Multilingual titles
  titleUz: string;
  titleRu: string | null;
  titleEn: string | null;

  // Multilingual descriptions
  descriptionUz: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;

  // Classification
  bookType: BookType;
  categoryId: string | null;
  subjectId: string | null; // UUID reference to subjects table
  gradeNumber: number | null; // 1-11

  // Authors & Publishers
  authors: string[]; // Array of author names
  publisher: string | null;
  publishYear: number | null;
  isbn: string | null;

  // File Information
  pdfUrl: string;
  pdfFilename: string;
  pdfSizeBytes: number | null;
  pageCount: number | null;
  coverImageUrl: string | null;

  // Access Control
  accessLevel: BookAccess;

  // Metadata & Stats
  viewsCount: number;
  downloadsCount: number;
  bookmarksCount: number;

  // SEO
  slug: string | null;
  keywords: string[];

  // Status
  isActive: boolean;
  uploadedBy: string | null; // User ID (TEXT type)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations (populated when needed)
  category?: LibraryCategory;
  isBookmarked?: boolean; // For current user
  readingProgress?: ReadingProgress; // For current user
}

/**
 * Library Bookmark
 * User's saved/bookmarked books
 */
export interface LibraryBookmark {
  id: string;
  userId: string; // TEXT type to match users.id
  bookId: string;
  createdAt: Date;

  // Relations (populated when needed)
  book?: LibraryBook;
}

/**
 * Reading Progress
 * Tracks user's reading progress for each book
 */
export interface ReadingProgress {
  id: string;
  userId: string; // TEXT type to match users.id
  bookId: string;

  currentPage: number;
  totalPages: number;
  progressPercentage: number; // 0.00 to 100.00

  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Relations (populated when needed)
  book?: LibraryBook;
}

/**
 * Library Download
 * Tracks book downloads for analytics
 */
export interface LibraryDownload {
  id: string;
  userId: string; // TEXT type to match users.id
  bookId: string;
  downloadedAt: Date;

  // Relations (populated when needed)
  book?: LibraryBook;
}

// ============================================
// API Request/Response Types
// ============================================

/**
 * Create Library Category Request
 */
export interface CreateCategoryRequest {
  nameUz: string;
  nameRu?: string;
  nameEn?: string;
  slug: string;
  descriptionUz?: string;
  parentCategoryId?: string;
  linkedSubjectId?: string;
  linkedGrade?: number;
  categoryType?: LibraryCategoryType;
  icon?: string;
  sortOrder?: number;
}

/**
 * Update Library Category Request
 */
export interface UpdateCategoryRequest {
  nameUz?: string;
  nameRu?: string;
  nameEn?: string;
  slug?: string;
  descriptionUz?: string;
  parentCategoryId?: string;
  linkedSubjectId?: string;
  linkedGrade?: number;
  categoryType?: LibraryCategoryType;
  icon?: string;
  sortOrder?: number;
}

/**
 * Create Library Book Request
 */
export interface CreateBookRequest {
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  bookType?: BookType;
  categoryId?: string;
  subjectId?: string;
  gradeNumber?: number;
  authors?: string[];
  publisher?: string;
  publishYear?: number;
  isbn?: string;
  pdfUrl: string;
  pdfFilename: string;
  pdfSizeBytes?: number;
  pageCount?: number;
  coverImageUrl?: string;
  accessLevel?: BookAccess;
  slug?: string;
  keywords?: string[];
  isActive?: boolean;
}

/**
 * Update Library Book Request
 */
export interface UpdateBookRequest {
  titleUz?: string;
  titleRu?: string;
  titleEn?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  bookType?: BookType;
  categoryId?: string;
  subjectId?: string;
  gradeNumber?: number;
  authors?: string[];
  publisher?: string;
  publishYear?: number;
  isbn?: string;
  coverImageUrl?: string;
  accessLevel?: BookAccess;
  slug?: string;
  keywords?: string[];
  isActive?: boolean;
}

/**
 * Get Books Query Parameters
 */
export interface GetBooksQuery {
  categoryId?: string;
  subjectId?: string;
  gradeNumber?: number;
  bookType?: BookType;
  accessLevel?: BookAccess;
  search?: string; // Search in title, authors, keywords
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'titleUz' | 'viewsCount' | 'downloadsCount';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

/**
 * Paginated Books Response
 */
export interface PaginatedBooksResponse {
  books: LibraryBook[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Update Reading Progress Request
 */
export interface UpdateReadingProgressRequest {
  currentPage: number;
  totalPages: number;
}

/**
 * Book Statistics
 */
export interface BookStatistics {
  totalBooks: number;
  totalByType: Record<BookType, number>;
  totalByAccess: Record<BookAccess, number>;
  totalViews: number;
  totalDownloads: number;
  totalBookmarks: number;
  topBooks: LibraryBook[]; // Top 10 by views
  recentBooks: LibraryBook[]; // Latest 10
}

/**
 * Category with Books
 */
export interface CategoryWithBooks extends LibraryCategory {
  books: LibraryBook[];
  booksCount: number;
}

/**
 * User Library Stats
 */
export interface UserLibraryStats {
  bookmarksCount: number;
  booksReadingCount: number; // Books with progress > 0
  booksCompletedCount: number; // Books with progress = 100
  downloadsCount: number;
  recentlyRead: LibraryBook[];
  bookmarkedBooks: LibraryBook[];
}

// ============================================
// Helper Types
// ============================================

/**
 * Book with User Context
 * Includes user-specific data (bookmarks, progress)
 */
export interface BookWithUserContext extends LibraryBook {
  isBookmarked: boolean;
  readingProgress: ReadingProgress | null;
}

/**
 * Category Tree Node
 * For rendering hierarchical category trees
 */
export interface CategoryTreeNode extends LibraryCategory {
  children: CategoryTreeNode[];
  depth: number;
}
