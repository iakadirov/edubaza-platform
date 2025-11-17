# Content Visibility Management

## Обзор

Управление видимостью предметов и классов теперь осуществляется через базу данных, а не через настройки. Это обеспечивает:
- ✅ Единый источник истины
- ✅ Отсутствие дублирования данных
- ✅ Простоту управления через админ-панель
- ✅ Историю изменений

## Архитектура

### Таблица `subjects`

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name_uz VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,      -- Новое поле
  display_order INTEGER DEFAULT 0,       -- Новое поле
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Новые поля:**
- `is_visible` - Видим ли предмет пользователям в UI (dropdowns, формах)
- `display_order` - Порядок отображения в списках (1, 2, 3...)

### Таблица `topics`

```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id),
  grade_number INTEGER NOT NULL,
  title_uz VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,      -- Новое поле
  is_published BOOLEAN DEFAULT FALSE,    -- Новое поле
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Новые поля:**
- `is_visible` - Видима ли тема пользователям
- `is_published` - Готов ли контент темы к использованию

## Использование

### Получение видимых предметов

```typescript
// SQL
SELECT * FROM subjects
WHERE is_active = TRUE
  AND is_visible = TRUE
ORDER BY display_order;

// API
GET /api/subjects?visible=true
```

### Получение доступных классов

```typescript
// Все доступные классы (уникальные значения из topics)
SELECT DISTINCT grade_number
FROM topics
WHERE is_active = TRUE
  AND is_visible = TRUE
ORDER BY grade_number;

// API
GET /api/grades?visible=true
```

### Получение предметов для класса

```typescript
SELECT DISTINCT s.*
FROM subjects s
JOIN topics t ON t.subject_id = s.id
WHERE t.grade_number = 5
  AND s.is_visible = TRUE
  AND t.is_visible = TRUE
ORDER BY s.display_order;
```

## Сценарии использования

### 1. Мягкий запуск предмета

```sql
-- Добавляем предмет, но пока не показываем пользователям
INSERT INTO subjects (code, name_uz, is_visible)
VALUES ('fizika', 'Fizika', FALSE);

-- Добавляем контент и темы
INSERT INTO topics (subject_id, grade_number, title_uz, is_visible)
VALUES ('...', 7, 'Mexanika', FALSE);

-- Когда готово - делаем видимым
UPDATE subjects SET is_visible = TRUE WHERE code = 'fizika';
UPDATE topics SET is_visible = TRUE WHERE subject_id = '...';
```

### 2. Временное отключение класса

```sql
-- Временно скрываем 11 класс (например, на ремонт контента)
UPDATE topics
SET is_visible = FALSE
WHERE grade_number = 11;

-- Возвращаем обратно
UPDATE topics
SET is_visible = TRUE
WHERE grade_number = 11;
```

### 3. A/B тестирование

```sql
-- Можно создавать разные представления для разных групп
-- через additional флаги или отдельные таблицы visibility_rules
```

## Преимущества перед настройками

### ❌ Старый подход (через settings)
```typescript
// settings
{
  'content.availableSubjects': ['Matematika', 'Ona tili'],
  'content.availableGrades': [1, 2, 3, 4, 5]
}

// subjects table
subjects: [
  { code: 'matematika', name: 'Matematika' },
  { code: 'onatili', name: 'Ona tili' },
  { code: 'fizika', name: 'Fizika' } // Существует, но не в settings!
]

// Проблемы:
// - Дублирование данных
// - Рассинхронизация
// - Сложность управления
```

### ✅ Новый подход (через БД)
```typescript
// subjects table
subjects: [
  { code: 'matematika', name: 'Matematika', is_visible: true },
  { code: 'onatili', name: 'Ona tili', is_visible: true },
  { code: 'fizika', name: 'Fizika', is_visible: false } // Есть, но скрыт
]

// Преимущества:
// - Один источник истины
// - Управление через UI админки
// - История изменений в БД
// - Нет рассинхронизации
```

## API Endpoints (планируется)

```typescript
// Получить видимые предметы
GET /api/subjects?visible=true

// Изменить видимость предмета
PATCH /api/admin/subjects/:id
{ "is_visible": true }

// Получить доступные классы
GET /api/grades?visible=true

// Изменить видимость тем класса
PATCH /api/admin/topics/bulk-visibility
{ "grade_number": 11, "is_visible": false }
```

## Миграция

```bash
# Применить миграцию
cat scripts/add-visibility-fields.sql | docker exec -i edubaza_postgres psql -U edubaza -d edubaza

# Удалить старые настройки
docker exec edubaza_postgres psql -U edubaza -d edubaza -c \
  "DELETE FROM site_settings WHERE \"settingKey\" IN ('content.availableSubjects', 'content.availableGrades');"
```

## UI в админ-панели

В разделе **Структура** (`/admin/structure`) теперь можно:
- ✅ Включать/отключать видимость предметов
- ✅ Изменять порядок отображения
- ✅ Управлять видимостью тем по классам
- ✅ Массовое включение/отключение

## Интеграция в существующий код

```typescript
// До
const subjects = settings['content.availableSubjects'];

// После
const subjects = await db.query(`
  SELECT * FROM subjects
  WHERE is_visible = TRUE
  ORDER BY display_order
`);
```

## Дальнейшие улучшения

1. **UI в админке** - добавить чекбоксы для is_visible в таблицах
2. **Bulk operations** - массовое включение/отключение
3. **History tracking** - логирование изменений видимости
4. **Роли** - разные предметы для разных типов пользователей
5. **Временные окна** - автоматическое включение/отключение по расписанию
