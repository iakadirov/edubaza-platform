-- Migration: 002 - Insert Initial Library Categories
-- Description: Inserts demo categories for the library module
-- Date: 2025-12-08
-- Updated: Uses subject UUIDs instead of codes

-- ==================================
-- 1. ROOT CATEGORIES (5 main types)
-- ==================================

-- 1. Davlat darsliklari (Government Textbooks)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, description_uz, category_type, icon, sort_order)
VALUES (
  'Davlat darsliklari',
  'Государственные учебники',
  'Government Textbooks',
  'government-textbooks',
  'Umumiy ta''lim maktablari uchun davlat standartlari asosida chop etilgan darsliklar',
  'GOVERNMENT_TEXTBOOK',
  'book-open',
  1
);

-- 2. Qo'shimcha adabiyotlar (Supplementary Materials)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, description_uz, category_type, icon, sort_order)
VALUES (
  'Qo''shimcha adabiyotlar',
  'Дополнительная литература',
  'Supplementary Materials',
  'supplementary-materials',
  'O''quv dasturini chuqurlashtirish va mustaqil ta''lim uchun qo''shimcha kitoblar',
  'SUPPLEMENTARY',
  'books',
  2
);

-- 3. Badiiy adabiyot (Fiction)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, description_uz, category_type, icon, sort_order)
VALUES (
  'Badiiy adabiyot',
  'Художественная литература',
  'Fiction',
  'fiction',
  'Klassik va zamonaviy badiiy asarlar',
  'FICTION',
  'book-heart',
  3
);

-- 4. Ma'lumotnomalar (Reference)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, description_uz, category_type, icon, sort_order)
VALUES (
  'Ma''lumotnomalar',
  'Справочники',
  'Reference',
  'reference',
  'Lug''atlar, ensiklopediyalar va boshqa ma''lumotnomalar',
  'REFERENCE',
  'library',
  4
);

-- 5. Jurnallar (Magazines)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, description_uz, category_type, icon, sort_order)
VALUES (
  'Jurnallar',
  'Журналы',
  'Magazines',
  'magazines',
  'Ta''lim, fan va ommabop jurnallar',
  'MAGAZINE',
  'newspaper',
  5
);

-- ==================================
-- 2. CHILD CATEGORIES - Government Textbooks by Subject
-- ==================================

-- Matematika (linked to MATHEMATICS subject)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, linked_subject_id, category_type, icon, sort_order)
VALUES (
  'Matematika',
  'Математика',
  'Mathematics',
  'government-textbooks-mathematics',
  (SELECT id FROM library_categories WHERE slug = 'government-textbooks'),
  (SELECT id FROM subjects WHERE code = 'MATHEMATICS'),
  'GOVERNMENT_TEXTBOOK',
  'calculator',
  1
);

-- Ingliz tili (linked to ENGLISH_LANGUAGE subject)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, linked_subject_id, category_type, icon, sort_order)
VALUES (
  'Ingliz tili',
  'Английский язык',
  'English Language',
  'government-textbooks-english',
  (SELECT id FROM library_categories WHERE slug = 'government-textbooks'),
  (SELECT id FROM subjects WHERE code = 'ENGLISH_LANGUAGE'),
  'GOVERNMENT_TEXTBOOK',
  'language',
  2
);

-- Fizika (linked to PHYSICS subject)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, linked_subject_id, category_type, icon, sort_order)
VALUES (
  'Fizika',
  'Физика',
  'Physics',
  'government-textbooks-physics',
  (SELECT id FROM library_categories WHERE slug = 'government-textbooks'),
  (SELECT id FROM subjects WHERE code = 'PHYSICS'),
  'GOVERNMENT_TEXTBOOK',
  'atom',
  3
);

-- ==================================
-- 3. CHILD CATEGORIES - Supplementary Materials by Subject
-- ==================================

-- Matematika (supplementary)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, linked_subject_id, category_type, icon, sort_order)
VALUES (
  'Matematika',
  'Математика',
  'Mathematics',
  'supplementary-mathematics',
  (SELECT id FROM library_categories WHERE slug = 'supplementary-materials'),
  (SELECT id FROM subjects WHERE code = 'MATHEMATICS'),
  'SUPPLEMENTARY',
  'calculator',
  1
);

-- Ingliz tili (supplementary) - PARENT for sub-categories
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, linked_subject_id, category_type, icon, sort_order)
VALUES (
  'Ingliz tili',
  'Английский язык',
  'English Language',
  'supplementary-english',
  (SELECT id FROM library_categories WHERE slug = 'supplementary-materials'),
  (SELECT id FROM subjects WHERE code = 'ENGLISH_LANGUAGE'),
  'SUPPLEMENTARY',
  'language',
  2
);

-- Sub-categories for English supplementary materials (3rd level hierarchy)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, category_type, icon, sort_order)
VALUES
  (
    'Fonetika',
    'Фонетика',
    'Phonetics',
    'supplementary-english-phonetics',
    (SELECT id FROM library_categories WHERE slug = 'supplementary-english'),
    'SUPPLEMENTARY',
    'mic',
    1
  ),
  (
    'Grammatika',
    'Грамматика',
    'Grammar',
    'supplementary-english-grammar',
    (SELECT id FROM library_categories WHERE slug = 'supplementary-english'),
    'SUPPLEMENTARY',
    'book-text',
    2
  ),
  (
    'Lug''at boyitish',
    'Лексика',
    'Vocabulary',
    'supplementary-english-vocabulary',
    (SELECT id FROM library_categories WHERE slug = 'supplementary-english'),
    'SUPPLEMENTARY',
    'spell-check',
    3
  );

-- Fizika (supplementary)
INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, linked_subject_id, category_type, icon, sort_order)
VALUES (
  'Fizika',
  'Физика',
  'Physics',
  'supplementary-physics',
  (SELECT id FROM library_categories WHERE slug = 'supplementary-materials'),
  (SELECT id FROM subjects WHERE code = 'PHYSICS'),
  'SUPPLEMENTARY',
  'atom',
  3
);

-- ==================================
-- 4. CHILD CATEGORIES - Fiction
-- ==================================

INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, category_type, icon, sort_order)
VALUES
  (
    'Klassik asarlar',
    'Классическая литература',
    'Classic Literature',
    'fiction-classics',
    (SELECT id FROM library_categories WHERE slug = 'fiction'),
    'FICTION',
    'book-bookmark',
    1
  ),
  (
    'Bolalar adabiyoti',
    'Детская литература',
    'Children''s Literature',
    'fiction-children',
    (SELECT id FROM library_categories WHERE slug = 'fiction'),
    'FICTION',
    'baby',
    2
  ),
  (
    'She''riyat',
    'Поэзия',
    'Poetry',
    'fiction-poetry',
    (SELECT id FROM library_categories WHERE slug = 'fiction'),
    'FICTION',
    'feather',
    3
  );

-- ==================================
-- 5. CHILD CATEGORIES - Reference
-- ==================================

INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, category_type, icon, sort_order)
VALUES
  (
    'Lug''atlar',
    'Словари',
    'Dictionaries',
    'reference-dictionaries',
    (SELECT id FROM library_categories WHERE slug = 'reference'),
    'REFERENCE',
    'book-a',
    1
  ),
  (
    'Ensiklopediyalar',
    'Энциклопедии',
    'Encyclopedias',
    'reference-encyclopedias',
    (SELECT id FROM library_categories WHERE slug = 'reference'),
    'REFERENCE',
    'globe',
    2
  );

-- ==================================
-- 6. CHILD CATEGORIES - Magazines
-- ==================================

INSERT INTO library_categories (name_uz, name_ru, name_en, slug, parent_category_id, category_type, icon, sort_order)
VALUES
  (
    'Ta''lim jurnallari',
    'Образовательные журналы',
    'Educational Magazines',
    'magazines-educational',
    (SELECT id FROM library_categories WHERE slug = 'magazines'),
    'MAGAZINE',
    'graduation-cap',
    1
  ),
  (
    'Fan jurnallari',
    'Научные журналы',
    'Science Magazines',
    'magazines-science',
    (SELECT id FROM library_categories WHERE slug = 'magazines'),
    'MAGAZINE',
    'flask',
    2
  );

-- Migration complete
-- Total categories created: 5 root + 18 child = 23 categories
