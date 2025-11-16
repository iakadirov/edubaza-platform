-- =========================================
-- МИГРАЦИЯ: Архитектура контента
-- Дата: 2025-11-15
-- Описание: Создание иерархической структуры контента
-- =========================================

-- 1. КЛАССЫ (Grades)
-- =========================================
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE CHECK (number >= 1 AND number <= 11),
  name_uz VARCHAR(50) NOT NULL,
  name_ru VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_grades_number ON grades(number);
CREATE INDEX IF NOT EXISTS idx_grades_is_active ON grades(is_active);

-- Заполнение данными
INSERT INTO grades (number, name_uz, name_ru) VALUES
  (1, '1-sinf', '1 класс'),
  (2, '2-sinf', '2 класс'),
  (3, '3-sinf', '3 класс'),
  (4, '4-sinf', '4 класс'),
  (5, '5-sinf', '5 класс'),
  (6, '6-sinf', '6 класс'),
  (7, '7-sinf', '7 класс'),
  (8, '8-sinf', '8 класс'),
  (9, '9-sinf', '9 класс'),
  (10, '10-sinf', '10 класс'),
  (11, '11-sinf', '11 класс')
ON CONFLICT (number) DO NOTHING;

-- 2. ПРЕДМЕТЫ (Subjects)
-- =========================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name_uz VARCHAR(100) NOT NULL,
  name_ru VARCHAR(100) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_sort_order ON subjects(sort_order);

-- Заполнение предметами
INSERT INTO subjects (code, name_uz, name_ru, icon, color, sort_order) VALUES
  ('MATHEMATICS', 'Matematika', 'Математика', '🔢', '#3B82F6', 1),
  ('PHYSICS', 'Fizika', 'Физика', '⚛️', '#8B5CF6', 2),
  ('CHEMISTRY', 'Kimyo', 'Химия', '🧪', '#10B981', 3),
  ('BIOLOGY', 'Biologiya', 'Биология', '🧬', '#059669', 4),
  ('RUSSIAN_LANGUAGE', 'Rus tili', 'Русский язык', '🇷🇺', '#EF4444', 5),
  ('UZBEK_LANGUAGE', 'Oʻzbek tili', 'Узбекский язык', '🇺🇿', '#06B6D4', 6),
  ('ENGLISH_LANGUAGE', 'Ingliz tili', 'Английский язык', '🇬🇧', '#6366F1', 7),
  ('HISTORY', 'Tarix', 'История', '📜', '#F59E0B', 8),
  ('GEOGRAPHY', 'Geografiya', 'География', '🗺️', '#14B8A6', 9),
  ('LITERATURE', 'Adabiyot', 'Литература', '📚', '#EC4899', 10),
  ('INFORMATICS', 'Informatika', 'Информатика', '💻', '#8B5CF6', 11)
ON CONFLICT (code) DO NOTHING;

-- 3. СВЯЗЬ ПРЕДМЕТОВ И КЛАССОВ (Subject_Grades)
-- =========================================
CREATE TABLE IF NOT EXISTS subject_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade_number INTEGER NOT NULL CHECK (grade_number >= 1 AND grade_number <= 11),
  is_active BOOLEAN DEFAULT TRUE,
  hours_per_week INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(subject_id, grade_number)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_subject_grades_subject ON subject_grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_grades_grade ON subject_grades(grade_number);
CREATE INDEX IF NOT EXISTS idx_subject_grades_active ON subject_grades(is_active);

-- Заполнение связями (Математика: 1-11 классы)
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 5
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'MATHEMATICS'
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Физика: 6-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 3
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'PHYSICS' AND g.number >= 6
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Химия: 7-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 2
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'CHEMISTRY' AND g.number >= 7
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Биология: 6-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 2
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'BIOLOGY' AND g.number >= 6
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Русский язык: 1-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 3
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'RUSSIAN_LANGUAGE'
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Узбекский язык: 1-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 3
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'UZBEK_LANGUAGE'
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Английский язык: 1-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 2
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'ENGLISH_LANGUAGE'
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- История: 5-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 2
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'HISTORY' AND g.number >= 5
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- География: 6-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 2
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'GEOGRAPHY' AND g.number >= 6
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Литература: 5-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 2
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'LITERATURE' AND g.number >= 5
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- Информатика: 5-11 классы
INSERT INTO subject_grades (subject_id, grade_number, hours_per_week)
SELECT s.id, g.number, 1
FROM subjects s
CROSS JOIN grades g
WHERE s.code = 'INFORMATICS' AND g.number >= 5
ON CONFLICT (subject_id, grade_number) DO NOTHING;

-- 4. ТЕМЫ (Topics) - Обновление существующей таблицы
-- =========================================
-- Переименовываем старую таблицу если она существует
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'curriculum_topics') THEN
    -- Добавляем новые колонки если их нет
    ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS description_uz TEXT;
    ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS description_ru TEXT;
    ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS quarter INTEGER;
    ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS week_number INTEGER;
    ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    ALTER TABLE curriculum_topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

    -- Переименовываем колонки если нужно
    ALTER TABLE curriculum_topics RENAME COLUMN topic_uz TO title_uz;
    ALTER TABLE curriculum_topics RENAME COLUMN topic_ru TO title_ru;

    -- Обновляем subject на subject_id (UUID)
    -- Это нужно сделать постепенно через маппинг
  END IF;
END $$;

-- Или создаём новую таблицу topics
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade_number INTEGER NOT NULL CHECK (grade_number >= 1 AND grade_number <= 11),

  title_uz VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,

  quarter INTEGER CHECK (quarter >= 1 AND quarter <= 4),
  week_number INTEGER,
  keywords TEXT[],

  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(subject_id, grade_number, title_uz)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_grade ON topics(grade_number);
CREATE INDEX IF NOT EXISTS idx_topics_subject_grade ON topics(subject_id, grade_number);
CREATE INDEX IF NOT EXISTS idx_topics_quarter ON topics(quarter);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_keywords ON topics USING GIN(keywords);

-- 5. ТИПЫ КОНТЕНТА (Content_Types)
-- =========================================
CREATE TABLE IF NOT EXISTS content_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name_uz VARCHAR(100) NOT NULL,
  name_ru VARCHAR(100) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Заполнение типами контента
INSERT INTO content_types (code, name_uz, name_ru, icon) VALUES
  ('TASK', 'Vazifa', 'Задача', '📝'),
  ('PROBLEM', 'Masala', 'Задача с решением', '🔢'),
  ('QUESTION', 'Savol', 'Вопрос', '❓'),
  ('TEST', 'Test', 'Тест', '📋'),
  ('PRESENTATION', 'Taqdimot', 'Презентация', '📊'),
  ('VIDEO', 'Video dars', 'Видео урок', '🎥'),
  ('WORKSHEET', 'Ish varaqi', 'Рабочий лист', '📄'),
  ('OLYMPIC', 'Olimpiada', 'Олимпиада', '🏆')
ON CONFLICT (code) DO NOTHING;

-- 6. КОНТЕНТ (Content_Items)
-- =========================================
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  content_type_id UUID NOT NULL REFERENCES content_types(id),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

  title_uz VARCHAR(255),
  title_ru VARCHAR(255),
  content JSONB NOT NULL,

  difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  duration_minutes INTEGER,
  tags TEXT[],

  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),

  created_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),

  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  is_active BOOLEAN DEFAULT TRUE,
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_content_topic ON content_items(topic_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type_id);
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content_items(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_is_active ON content_items(is_active);
CREATE INDEX IF NOT EXISTS idx_content_tags ON content_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_content ON content_items USING GIN(content);

-- 7. ОЛИМПИАДЫ (Olympics)
-- =========================================
CREATE TABLE IF NOT EXISTS olympics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title_uz VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255) NOT NULL,
  description_uz TEXT,
  description_ru TEXT,

  subject_id UUID NOT NULL REFERENCES subjects(id),
  grade_numbers INTEGER[] NOT NULL,

  olympic_type VARCHAR(50),

  start_date TIMESTAMP,
  end_date TIMESTAMP,

  tasks JSONB,

  status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'FINISHED')),
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_olympics_subject ON olympics(subject_id);
CREATE INDEX IF NOT EXISTS idx_olympics_grades ON olympics USING GIN(grade_numbers);
CREATE INDEX IF NOT EXISTS idx_olympics_status ON olympics(status);
CREATE INDEX IF NOT EXISTS idx_olympics_dates ON olympics(start_date, end_date);

-- 8. ПРАВА ДОСТУПА (Content_Permissions)
-- =========================================
CREATE TABLE IF NOT EXISTS content_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_plan VARCHAR(20) NOT NULL CHECK (subscription_plan IN ('FREE', 'PRO', 'SCHOOL')),
  content_type_id UUID REFERENCES content_types(id),

  max_generations_per_month INTEGER,
  max_downloads_per_month INTEGER,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_export_pdf BOOLEAN DEFAULT TRUE,
  can_export_word BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(subscription_plan, content_type_id)
);

-- Заполнение прав доступа
INSERT INTO content_permissions (subscription_plan, content_type_id, max_generations_per_month, can_export_word)
SELECT 'FREE', id, 10, FALSE FROM content_types WHERE code = 'WORKSHEET'
ON CONFLICT (subscription_plan, content_type_id) DO NOTHING;

INSERT INTO content_permissions (subscription_plan, content_type_id, max_generations_per_month, can_export_word)
SELECT 'PRO', id, 100, TRUE FROM content_types WHERE code = 'WORKSHEET'
ON CONFLICT (subscription_plan, content_type_id) DO NOTHING;

INSERT INTO content_permissions (subscription_plan, content_type_id, max_generations_per_month, can_export_word)
SELECT 'SCHOOL', id, NULL, TRUE FROM content_types WHERE code = 'WORKSHEET'
ON CONFLICT (subscription_plan, content_type_id) DO NOTHING;

-- 9. ОБНОВЛЕНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- =========================================

-- Добавляем topic_id к worksheets
ALTER TABLE worksheets ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id);
CREATE INDEX IF NOT EXISTS idx_worksheets_topic ON worksheets(topic_id);

-- Комментарий для документации
COMMENT ON TABLE grades IS 'Классы с 1 по 11';
COMMENT ON TABLE subjects IS 'Учебные предметы';
COMMENT ON TABLE subject_grades IS 'Связь предметов с классами';
COMMENT ON TABLE topics IS 'Темы учебной программы';
COMMENT ON TABLE content_types IS 'Типы образовательного контента';
COMMENT ON TABLE content_items IS 'Образовательный контент (задачи, тесты и т.д.)';
COMMENT ON TABLE olympics IS 'Олимпиады по предметам';
COMMENT ON TABLE content_permissions IS 'Права доступа к контенту по подпискам';

-- Завершено!
