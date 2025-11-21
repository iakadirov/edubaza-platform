-- Добавление полей logo и banner к таблице subjects
-- Дата: 2025-11-20
-- Описание: Добавляем URL для логотипа (SVG/PNG) и баннера (горизонтальное изображение) для страниц предметов

ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS logo TEXT,
ADD COLUMN IF NOT EXISTS banner TEXT;

-- Комментарии к колонкам
COMMENT ON COLUMN subjects.logo IS 'URL логотипа предмета (SVG или PNG)';
COMMENT ON COLUMN subjects.banner IS 'URL баннера предмета (горизонтальное изображение, рекомендуемая ширина 1280px)';
