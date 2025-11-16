-- =========================================
-- ИСПРАВЛЕНИЕ: Создание topics и content_items
-- Дата: 2025-11-15
-- =========================================

-- 1. Создаём таблицу topics (новая, отдельная от curriculum_topics)
-- =========================================
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

-- 2. Создаём таблицу content_items (с text для created_by/reviewed_by)
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

  -- Изменено: TEXT вместо UUID для совместимости с существующей таблицей users
  created_by TEXT REFERENCES users(id),
  reviewed_by TEXT REFERENCES users(id),

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

-- 3. Добавляем topic_id к worksheets (если ещё не добавлено)
-- =========================================
ALTER TABLE worksheets ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id);
CREATE INDEX IF NOT EXISTS idx_worksheets_topic ON worksheets(topic_id);

-- 4. Мигрируем данные из curriculum_topics в topics
-- =========================================
INSERT INTO topics (subject_id, grade_number, title_uz, title_ru, description, keywords, quarter, is_active)
SELECT
  s.id as subject_id,
  ct.grade as grade_number,
  ct."topicUz" as title_uz,
  COALESCE(ct."topicRu", ct."topicUz") as title_ru,
  ct.description as description_uz,
  ct.keywords,
  ct.quarter,
  ct."isActive"
FROM curriculum_topics ct
JOIN subjects s ON s.code = ct.subject
WHERE NOT EXISTS (
  SELECT 1 FROM topics t
  WHERE t.subject_id = s.id
  AND t.grade_number = ct.grade
  AND t.title_uz = ct."topicUz"
);

-- Комментарии
COMMENT ON TABLE topics IS 'Темы учебной программы (новая архитектура)';
COMMENT ON TABLE content_items IS 'Образовательный контент (задачи, тесты и т.д.)';

-- Готово!
SELECT 'Migration completed successfully!' as status;
