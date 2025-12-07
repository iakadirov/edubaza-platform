# Edubaza Library Module - Architecture Plan

## 1. Overview

The Library module will provide access to educational books, journals, and materials for students, teachers, and parents. It will include features for browsing, searching, reading (with flipbook effect), bookmarking, and tracking reading progress.

---

## 2. Module Structure

```
edubaza-platform/
├── app/
│   ├── library/
│   │   ├── page.tsx                    # Main library page (browse/search)
│   │   ├── [bookId]/
│   │   │   ├── page.tsx                # Book details page
│   │   │   └── read/
│   │   │       └── page.tsx            # Book reader with flipbook
│   │   ├── categories/
│   │   │   └── [categoryId]/
│   │   │       └── page.tsx            # Category page
│   │   └── my-books/
│   │       └── page.tsx                # User's saved/bookmarked books
│   ├── api/
│   │   └── library/
│   │       ├── books/
│   │       │   ├── route.ts            # GET /api/library/books - List books
│   │       │   ├── [bookId]/
│   │       │   │   ├── route.ts        # GET /api/library/books/:id - Book details
│   │       │   │   └── progress/
│   │       │   │       └── route.ts    # POST /api/library/books/:id/progress - Save progress
│   │       │   └── upload/
│   │       │       └── route.ts        # POST /api/library/books/upload - Upload new book (admin)
│   │       ├── categories/
│   │       │   └── route.ts            # GET /api/library/categories - List categories
│   │       ├── bookmarks/
│   │       │   └── route.ts            # POST/DELETE /api/library/bookmarks - Manage bookmarks
│   │       └── search/
│   │           └── route.ts            # GET /api/library/search?q=... - Search books
│   └── admin/
│       └── library/
│           ├── page.tsx                # Admin: manage library
│           ├── upload/
│           │   └── page.tsx            # Admin: upload new books
│           └── categories/
│               └── page.tsx            # Admin: manage categories
├── components/
│   └── library/
│       ├── BookCard.tsx                # Book card for grid/list view
│       ├── BookGrid.tsx                # Grid of books
│       ├── BookList.tsx                # List of books
│       ├── BookDetails.tsx             # Book details component
│       ├── BookReader.tsx              # PDF reader container
│       ├── FlipbookViewer.tsx          # Flipbook effect viewer (PDF.js + react-pageflip)
│       ├── CategoryFilter.tsx          # Category filter component
│       ├── SearchBar.tsx               # Search input component
│       ├── ReadingProgress.tsx         # Progress bar/indicator
│       ├── BookmarkButton.tsx          # Bookmark toggle button
│       ├── DownloadButton.tsx          # Download PDF button
│       └── RecommendedBooks.tsx        # Recommended books section
├── lib/
│   ├── db-library.ts                   # Database helpers for library
│   ├── storage-library.ts              # Yandex Cloud storage for PDFs
│   └── pdf-utils.ts                    # PDF processing utilities
└── types/
    └── library.ts                      # TypeScript types for library
```

---

## 3. Database Schema

### Table: `library_categories`
```sql
CREATE TABLE library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  description_uz TEXT,
  icon VARCHAR(100),                     -- Icon name (e.g., 'book', 'journal')
  parent_category_id UUID REFERENCES library_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_categories_slug ON library_categories(slug);
CREATE INDEX idx_library_categories_parent ON library_categories(parent_category_id);
```

### Table: `library_books`
```sql
CREATE TYPE book_type AS ENUM ('BOOK', 'JOURNAL', 'MAGAZINE', 'WORKBOOK', 'REFERENCE');
CREATE TYPE book_access AS ENUM ('FREE', 'PRO', 'SCHOOL');

CREATE TABLE library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_uz VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500),
  title_en VARCHAR(500),
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,

  -- Classification
  book_type book_type DEFAULT 'BOOK',
  category_id UUID REFERENCES library_categories(id) ON DELETE SET NULL,
  subject subject,                       -- Links to existing subject enum (MATHEMATICS, etc.)
  grade_number INTEGER,                  -- 1-11, NULL for general books

  -- Authors & Publishers
  authors TEXT[],                        -- Array of author names
  publisher VARCHAR(255),
  publish_year INTEGER,
  isbn VARCHAR(20),

  -- File Information
  pdf_url TEXT NOT NULL,                 -- Yandex Cloud URL
  pdf_filename VARCHAR(255) NOT NULL,
  pdf_size_bytes BIGINT,
  page_count INTEGER,
  cover_image_url TEXT,                  -- Book cover thumbnail

  -- Access Control
  access_level book_access DEFAULT 'FREE',

  -- Metadata
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,

  -- SEO
  slug VARCHAR(500) UNIQUE,
  keywords TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_books_category ON library_books(category_id);
CREATE INDEX idx_library_books_subject ON library_books(subject);
CREATE INDEX idx_library_books_grade ON library_books(grade_number);
CREATE INDEX idx_library_books_slug ON library_books(slug);
CREATE INDEX idx_library_books_type ON library_books(book_type);
CREATE INDEX idx_library_books_access ON library_books(access_level);
CREATE INDEX idx_library_books_active ON library_books(is_active);
```

### Table: `library_bookmarks`
```sql
CREATE TABLE library_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_library_bookmarks_user ON library_bookmarks(user_id);
CREATE INDEX idx_library_bookmarks_book ON library_bookmarks(book_id);
```

### Table: `library_reading_progress`
```sql
CREATE TABLE library_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,

  current_page INTEGER DEFAULT 1,
  total_pages INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,  -- 0.00 to 100.00

  last_read_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_library_reading_progress_user ON library_reading_progress(user_id);
CREATE INDEX idx_library_reading_progress_book ON library_reading_progress(book_id);
CREATE INDEX idx_library_reading_progress_last_read ON library_reading_progress(last_read_at);
```

### Table: `library_downloads`
```sql
CREATE TABLE library_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_downloads_user ON library_downloads(user_id);
CREATE INDEX idx_library_downloads_book ON library_downloads(book_id);
CREATE INDEX idx_library_downloads_date ON library_downloads(downloaded_at);
```

---

## 4. TypeScript Types

**File: `types/library.ts`**

```typescript
export type BookType = 'BOOK' | 'JOURNAL' | 'MAGAZINE' | 'WORKBOOK' | 'REFERENCE';
export type BookAccess = 'FREE' | 'PRO' | 'SCHOOL';

export interface LibraryCategory {
  id: string;
  nameUz: string;
  nameRu: string | null;
  nameEn: string | null;
  slug: string;
  descriptionUz: string | null;
  icon: string | null;
  parentCategoryId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  subcategories?: LibraryCategory[];
  booksCount?: number;
}

export interface LibraryBook {
  id: string;
  titleUz: string;
  titleRu: string | null;
  titleEn: string | null;
  descriptionUz: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;

  bookType: BookType;
  categoryId: string | null;
  subject: string | null;
  gradeNumber: number | null;

  authors: string[];
  publisher: string | null;
  publishYear: number | null;
  isbn: string | null;

  pdfUrl: string;
  pdfFilename: string;
  pdfSizeBytes: number | null;
  pageCount: number | null;
  coverImageUrl: string | null;

  accessLevel: BookAccess;

  viewsCount: number;
  downloadsCount: number;
  bookmarksCount: number;

  slug: string | null;
  keywords: string[];

  isActive: boolean;
  uploadedBy: string | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  category?: LibraryCategory;
  isBookmarked?: boolean;
  readingProgress?: ReadingProgress;
}

export interface LibraryBookmark {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastReadAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LibraryDownload {
  id: string;
  userId: string;
  bookId: string;
  downloadedAt: Date;
}
```

---

## 5. Feature List

### 5.1 User Features
- **Browse Library**: View all books in grid/list format
- **Filter by Category**: Filter books by category, subject, grade
- **Search**: Full-text search by title, author, keywords
- **Book Details**: View book information, cover, description, metadata
- **Read Online**: Read books with flipbook effect (PDF.js + react-pageflip)
- **Bookmark Books**: Save books to "My Books"
- **Reading Progress**: Automatically save current page and progress
- **Download PDF**: Download books for offline reading (based on access level)
- **Recommended Books**: See related/recommended books

### 5.2 Teacher-Specific Features
- **Filter by Subject/Grade**: Quick access to curriculum-aligned books
- **Class Recommendations**: Recommend books to students

### 5.3 Admin Features
- **Upload Books**: Upload PDF files with metadata
- **Manage Categories**: Create/edit/delete categories
- **Manage Books**: Edit book details, change access levels
- **View Statistics**: Track views, downloads, popular books
- **Bulk Import**: Import multiple books via CSV + ZIP

---

## 6. API Endpoints

### 6.1 Books
```
GET    /api/library/books
       Query params: ?category=uuid&subject=MATHEMATICS&grade=5&type=BOOK&access=FREE&page=1&limit=20
       Response: { books: LibraryBook[], total: number, page: number, totalPages: number }

GET    /api/library/books/:id
       Response: { book: LibraryBook }

POST   /api/library/books/:id/view
       Body: {}
       Response: { success: true }

POST   /api/library/books/:id/progress
       Body: { currentPage: number, totalPages: number }
       Response: { progress: ReadingProgress }

GET    /api/library/books/:id/progress
       Response: { progress: ReadingProgress | null }

POST   /api/library/books/upload (Admin only)
       Body: FormData with PDF file + metadata
       Response: { book: LibraryBook }

PUT    /api/library/books/:id (Admin only)
       Body: Partial<LibraryBook>
       Response: { book: LibraryBook }

DELETE /api/library/books/:id (Admin only)
       Response: { success: true }
```

### 6.2 Categories
```
GET    /api/library/categories
       Response: { categories: LibraryCategory[] }

GET    /api/library/categories/:id
       Response: { category: LibraryCategory, books: LibraryBook[] }

POST   /api/library/categories (Admin only)
       Body: { nameUz, nameRu, nameEn, slug, icon, parentCategoryId }
       Response: { category: LibraryCategory }

PUT    /api/library/categories/:id (Admin only)
       Body: Partial<LibraryCategory>
       Response: { category: LibraryCategory }

DELETE /api/library/categories/:id (Admin only)
       Response: { success: true }
```

### 6.3 Bookmarks
```
GET    /api/library/bookmarks
       Response: { bookmarks: (LibraryBookmark & { book: LibraryBook })[] }

POST   /api/library/bookmarks
       Body: { bookId: string }
       Response: { bookmark: LibraryBookmark }

DELETE /api/library/bookmarks/:bookId
       Response: { success: true }
```

### 6.4 Search
```
GET    /api/library/search
       Query params: ?q=search+term&category=uuid&subject=MATHEMATICS&grade=5
       Response: { results: LibraryBook[], total: number }
```

### 6.5 Downloads
```
POST   /api/library/books/:id/download
       Response: { downloadUrl: string, expiresIn: number }
       Note: Creates signed URL for Yandex Cloud, logs download
```

---

## 7. Component Architecture

### 7.1 Main Pages

**`app/library/page.tsx`** - Library Browse Page
- Shows BookGrid or BookList
- CategoryFilter sidebar
- SearchBar component
- Pagination
- Sort options (newest, popular, title A-Z)

**`app/library/[bookId]/page.tsx`** - Book Details Page
- BookDetails component
- Cover image, title, authors, description
- "Read Online" button
- "Download PDF" button (if allowed)
- BookmarkButton
- ReadingProgress indicator
- RecommendedBooks section

**`app/library/[bookId]/read/page.tsx`** - Book Reader Page
- FlipbookViewer component (full-screen)
- Page navigation controls
- Zoom controls
- Fullscreen toggle
- Auto-save progress on page change
- Exit button to return to details

**`app/library/my-books/page.tsx`** - User's Bookmarked Books
- Shows user's bookmarked books
- Shows recently read books with progress
- Continue reading section

### 7.2 Core Components

**`components/library/FlipbookViewer.tsx`**
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';

interface FlipbookViewerProps {
  pdfUrl: string;
  bookId: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export default function FlipbookViewer({
  pdfUrl,
  bookId,
  initialPage = 1,
  onPageChange
}: FlipbookViewerProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const flipBookRef = useRef(null);

  useEffect(() => {
    loadPDF();
  }, [pdfUrl]);

  const loadPDF = async () => {
    try {
      // PDF.js setup
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const totalPages = pdf.numPages;
      const pageImages: string[] = [];

      // Render each page as canvas -> image
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        pageImages.push(canvas.toDataURL());
      }

      setPages(pageImages);
      setLoading(false);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setLoading(false);
    }
  };

  const handlePageFlip = (e: any) => {
    const newPage = e.data + 1;
    setCurrentPage(newPage);
    onPageChange?.(newPage);
  };

  if (loading) {
    return <div>Loading flipbook...</div>;
  }

  return (
    <div className="flipbook-container">
      <HTMLFlipBook
        ref={flipBookRef}
        width={550}
        height={733}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={handlePageFlip}
        className="flipbook"
        startPage={initialPage - 1}
      >
        {pages.map((pageUrl, index) => (
          <div key={index} className="page">
            <img src={pageUrl} alt={`Page ${index + 1}`} />
          </div>
        ))}
      </HTMLFlipBook>

      <div className="flipbook-controls">
        <button onClick={() => flipBookRef.current?.pageFlip().flipPrev()}>
          ← Previous
        </button>
        <span>Page {currentPage} / {pages.length}</span>
        <button onClick={() => flipBookRef.current?.pageFlip().flipNext()}>
          Next →
        </button>
      </div>
    </div>
  );
}
```

**`components/library/BookCard.tsx`**
- Book cover thumbnail
- Title, authors
- Category badge
- Grade/subject badges
- Bookmark icon
- View count
- Progress indicator (if user has started reading)

**`components/library/SearchBar.tsx`**
- Search input with debouncing
- Filter chips (category, subject, grade)
- Clear filters button

---

## 8. Storage Integration (Yandex Cloud)

**File: `lib/storage-library.ts`**

```typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  endpoint: process.env.YANDEX_CLOUD_ENDPOINT!,
  accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY_ID!,
  secretAccessKey: process.env.YANDEX_CLOUD_SECRET_ACCESS_KEY!,
  region: 'ru-central1',
  s3ForcePathStyle: true,
});

const BUCKET_NAME = process.env.YANDEX_CLOUD_BUCKET_NAME!;

export async function uploadBookPDF(
  file: File,
  bookId: string
): Promise<{ url: string; filename: string; sizeBytes: number }> {
  const filename = `library/books/${bookId}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: 'application/pdf',
    ACL: 'public-read',
  };

  await s3.upload(params).promise();

  const url = `${process.env.YANDEX_CLOUD_ENDPOINT}/${BUCKET_NAME}/${filename}`;

  return {
    url,
    filename: file.name,
    sizeBytes: file.size,
  };
}

export async function uploadBookCover(
  file: File,
  bookId: string
): Promise<string> {
  const filename = `library/covers/${bookId}/${Date.now()}-${file.name}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: 'public-read',
  };

  await s3.upload(params).promise();

  return `${process.env.YANDEX_CLOUD_ENDPOINT}/${BUCKET_NAME}/${filename}`;
}

export async function deleteBookFile(url: string): Promise<void> {
  const key = url.split(`${BUCKET_NAME}/`)[1];

  await s3.deleteObject({
    Bucket: BUCKET_NAME,
    Key: key,
  }).promise();
}

export function getSignedDownloadUrl(pdfUrl: string, expiresIn = 3600): string {
  const key = pdfUrl.split(`${BUCKET_NAME}/`)[1];

  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn, // 1 hour
  });
}
```

---

## 9. Access Control

### 9.1 Book Access Levels
- **FREE**: Available to all users (students, teachers, parents)
- **PRO**: Only for PRO subscription users and all teachers
- **SCHOOL**: Only for SCHOOL subscription users

### 9.2 Middleware Check
```typescript
// In API routes
const user = await getCurrentUser(request);

if (book.accessLevel === 'PRO' && user.subscriptionPlan === 'FREE') {
  return NextResponse.json({ error: 'Требуется PRO подписка' }, { status: 403 });
}

if (book.accessLevel === 'SCHOOL' && user.subscriptionPlan !== 'SCHOOL') {
  return NextResponse.json({ error: 'Требуется SCHOOL подписка' }, { status: 403 });
}
```

---

## 10. PDF Processing

**File: `lib/pdf-utils.ts`**

```typescript
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function extractPDFMetadata(pdfBuffer: Buffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle() || null,
    author: pdfDoc.getAuthor() || null,
    subject: pdfDoc.getSubject() || null,
    keywords: pdfDoc.getKeywords()?.split(',').map(k => k.trim()) || [],
  };
}

export async function generateCoverFromPDF(pdfBuffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const firstPage = pdfDoc.getPage(0);

  // Render first page to image using pdf-lib + sharp
  // This is simplified - actual implementation may need canvas/node-canvas

  // For now, return placeholder or use external service
  throw new Error('Not implemented - use external service or canvas');
}
```

---

## 11. Integration with Existing System

### 11.1 Navigation
Add "Библиотека" / "Kutubxona" link to main navigation in:
- `components/AuthHeader.tsx`
- `app/dashboard/page.tsx` sidebar

### 11.2 Subject/Grade Filter
Reuse existing `subject` enum and `gradeNumber` from current system:
```typescript
import { Subject } from '@/types/subjects';

// Filter books by subject and grade
const books = await getBooks({
  subject: 'MATHEMATICS',
  gradeNumber: 5,
});
```

### 11.3 Access Control
Integrate with existing subscription system:
- Teachers automatically get PRO access to library
- Students with FREE plan can only access FREE books
- Students with PRO plan can access FREE + PRO books
- SCHOOL plan users can access all books

---

## 12. Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Create database tables
- Set up Yandex Cloud storage integration
- Create TypeScript types
- Build basic API endpoints (books CRUD, categories)

### Phase 2: Admin Panel (Week 1-2)
- Upload books interface
- Manage categories
- Edit book metadata
- View statistics

### Phase 3: User Interface (Week 2-3)
- Library browse page
- Book details page
- Search and filters
- Bookmarks

### Phase 4: PDF Reader (Week 3-4)
- Integrate PDF.js
- Integrate react-pageflip
- Build FlipbookViewer component
- Reading progress tracking
- Page navigation controls

### Phase 5: Advanced Features (Week 4+)
- Recommendations
- Download with signed URLs
- Cover image auto-generation
- Analytics dashboard

---

## 13. Dependencies to Install

```bash
npm install pdfjs-dist
npm install react-pageflip
npm install pdf-lib
npm install sharp
npm install aws-sdk  # Already installed for Yandex Cloud
```

---

## 14. Environment Variables

Add to `.env.local`:
```env
# Already exists:
YANDEX_CLOUD_ENDPOINT=https://storage.yandexcloud.net
YANDEX_CLOUD_ACCESS_KEY_ID=your_access_key
YANDEX_CLOUD_SECRET_ACCESS_KEY=your_secret_key
YANDEX_CLOUD_BUCKET_NAME=edubaza

# New (optional):
LIBRARY_PDF_MAX_SIZE_MB=100
LIBRARY_COVER_MAX_SIZE_MB=5
```

---

## 15. Security Considerations

1. **File Upload Validation**
   - Validate PDF file type and magic bytes
   - Limit file size (e.g., 100MB max)
   - Scan for malware (optional)

2. **Access Control**
   - Verify subscription plan before serving PDFs
   - Use signed URLs for downloads (prevents direct linking)
   - Rate limit downloads per user

3. **SQL Injection Prevention**
   - Use parameterized queries in `lib/db-library.ts`
   - Escape user input in search queries

4. **XSS Prevention**
   - Sanitize book titles, descriptions before rendering
   - Use Next.js built-in escaping

---

## 16. SEO Optimization

1. **Book Detail Pages**
   - Dynamic metadata with book title, description, authors
   - Open Graph tags for social sharing
   - Structured data (JSON-LD) for Google Books

2. **Category Pages**
   - SEO-friendly slugs (/library/categories/mathematics-grade-5)
   - Breadcrumbs

3. **Sitemap**
   - Add library books to sitemap.xml
   - Update weekly as new books are added

---

## Summary

This architecture provides:
- Comprehensive database schema for books, categories, bookmarks, and reading progress
- RESTful API design with clear endpoints
- Modular component structure with reusable pieces
- Flipbook integration using free libraries (PDF.js + react-pageflip)
- Access control based on subscription plans
- Integration with existing Edubaza systems (auth, subjects, grades)
- Yandex Cloud storage for PDF files
- Admin panel for content management
- User-friendly reading experience with progress tracking

Next steps:
1. Review and approve architecture
2. Create database tables (migrate)
3. Implement Phase 1 (API + storage)
4. Build admin upload interface
5. Develop user-facing pages and reader
