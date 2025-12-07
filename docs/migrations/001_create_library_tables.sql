-- Migration: 001 - Create Library Tables
-- Description: Creates all necessary tables for the library module
-- Date: 2025-12-08

-- ==================================
-- 1. CREATE ENUMS
-- ==================================

-- Book Type Enum
CREATE TYPE book_type AS ENUM (
  'BOOK',       -- Книга
  'JOURNAL',    -- Журнал
  'MAGAZINE',   -- Журнал/Периодика
  'WORKBOOK',   -- Рабочая тетрадь
  'REFERENCE'   -- Справочник
);

-- Book Access Level Enum
CREATE TYPE book_access AS ENUM (
  'FREE',   -- Доступно всем
  'PRO',    -- Только для PRO подписчиков
  'SCHOOL'  -- Только для SCHOOL подписчиков
);

-- Library Category Type Enum
CREATE TYPE library_category_type AS ENUM (
  'GOVERNMENT_TEXTBOOK',  -- Государственные учебники
  'SUPPLEMENTARY',        -- Дополнительная литература
  'FICTION',              -- Художественная литература
  'REFERENCE',            -- Справочники
  'MAGAZINE',             -- Журналы
  'OTHER'                 -- Прочее
);

-- ==================================
-- 2. CREATE TABLES
-- ==================================

-- Table: library_categories
-- Description: Categories for organizing books (hierarchical structure)
CREATE TABLE library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multilingual names
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),

  slug VARCHAR(255) UNIQUE NOT NULL,
  description_uz TEXT,

  -- Hierarchical structure
  parent_category_id UUID REFERENCES library_categories(id) ON DELETE SET NULL,

  -- Optional linking to subjects and grades
  linked_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,  -- Links to existing subjects table
  linked_grade INTEGER CHECK (linked_grade BETWEEN 1 AND 11),

  -- Category type
  category_type library_category_type DEFAULT 'OTHER',

  -- UI
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: library_books
-- Description: Main books table with metadata and access control
CREATE TABLE library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multilingual titles
  title_uz VARCHAR(500) NOT NULL,
  title_ru VARCHAR(500),
  title_en VARCHAR(500),

  -- Multilingual descriptions
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,

  -- Classification
  book_type book_type DEFAULT 'BOOK',
  category_id UUID REFERENCES library_categories(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,  -- Links to existing subjects table
  grade_number INTEGER CHECK (grade_number BETWEEN 1 AND 11),

  -- Authors & Publishers
  authors TEXT[],  -- Array of author names
  publisher VARCHAR(255),
  publish_year INTEGER,
  isbn VARCHAR(20),

  -- File Information
  pdf_url TEXT NOT NULL,
  pdf_filename VARCHAR(255) NOT NULL,
  pdf_size_bytes BIGINT,
  page_count INTEGER,
  cover_image_url TEXT,

  -- Access Control
  access_level book_access DEFAULT 'FREE',

  -- Metadata & Stats
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,

  -- SEO
  slug VARCHAR(500) UNIQUE,
  keywords TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT true,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,  -- TEXT type to match users.id

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: library_bookmarks
-- Description: User bookmarks/saved books
CREATE TABLE library_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- TEXT type to match users.id
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

-- Table: library_reading_progress
-- Description: Tracks user reading progress for each book
CREATE TABLE library_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- TEXT type to match users.id
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,

  current_page INTEGER DEFAULT 1,
  total_pages INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,  -- 0.00 to 100.00

  last_read_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

-- Table: library_downloads
-- Description: Tracks book downloads for analytics
CREATE TABLE library_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- TEXT type to match users.id
  book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT NOW()
);

-- ==================================
-- 3. CREATE INDEXES
-- ==================================

-- library_categories indexes
CREATE INDEX idx_library_categories_slug ON library_categories(slug);
CREATE INDEX idx_library_categories_parent ON library_categories(parent_category_id);
CREATE INDEX idx_library_categories_subject ON library_categories(linked_subject_id);
CREATE INDEX idx_library_categories_type ON library_categories(category_type);

-- library_books indexes
CREATE INDEX idx_library_books_category ON library_books(category_id);
CREATE INDEX idx_library_books_subject ON library_books(subject_id);
CREATE INDEX idx_library_books_grade ON library_books(grade_number);
CREATE INDEX idx_library_books_slug ON library_books(slug);
CREATE INDEX idx_library_books_type ON library_books(book_type);
CREATE INDEX idx_library_books_access ON library_books(access_level);
CREATE INDEX idx_library_books_active ON library_books(is_active);
CREATE INDEX idx_library_books_created ON library_books(created_at DESC);

-- library_bookmarks indexes
CREATE INDEX idx_library_bookmarks_user ON library_bookmarks(user_id);
CREATE INDEX idx_library_bookmarks_book ON library_bookmarks(book_id);

-- library_reading_progress indexes
CREATE INDEX idx_library_reading_progress_user ON library_reading_progress(user_id);
CREATE INDEX idx_library_reading_progress_book ON library_reading_progress(book_id);
CREATE INDEX idx_library_reading_progress_last_read ON library_reading_progress(last_read_at DESC);

-- library_downloads indexes
CREATE INDEX idx_library_downloads_user ON library_downloads(user_id);
CREATE INDEX idx_library_downloads_book ON library_downloads(book_id);
CREATE INDEX idx_library_downloads_date ON library_downloads(downloaded_at DESC);

-- ==================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ==================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER library_categories_updated_at
  BEFORE UPDATE ON library_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_library_updated_at();

CREATE TRIGGER library_books_updated_at
  BEFORE UPDATE ON library_books
  FOR EACH ROW
  EXECUTE FUNCTION update_library_updated_at();

CREATE TRIGGER library_reading_progress_updated_at
  BEFORE UPDATE ON library_reading_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_library_updated_at();

-- Migration complete
