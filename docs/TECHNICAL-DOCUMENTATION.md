# EduBaza.uz - Техническая документация

> Полная техническая документация для разработчиков проекта EduBaza.uz

## 📋 Содержание

- [Технологический стек](#технологический-стек)
- [Установка и настройка](#установка-и-настройка)
- [Структура проекта](#структура-проекта)
- [Аутентификация](#аутентификация)
- [API Endpoints](#api-endpoints)
- [База данных](#база-данных)
- [Профиль пользователя](#профиль-пользователя)
- [Команды разработки](#команды-разработки)
- [Известные ограничения](#известные-ограничения)
- [Прогресс разработки](#прогресс-разработки)

## 🚀 Технологический стек

### Frontend
- **Next.js 14** (App Router) - React фреймворк
- **TypeScript 5** - типизация
- **Tailwind CSS** - стилизация
- **React Hook Form** - формы

### Backend
- **Next.js API Routes** - серверная логика
- **PostgreSQL 16** - основная база данных
- **Redis 7** - кэширование и rate limiting
- **Prisma ORM** - работа с базой данных

### Внешние сервисы
- **Eskiz.uz** - отправка SMS OTP
- **Google Gemini API** - генерация заданий через AI
- **OpenAI API** - альтернативный AI провайдер
- **Click.uz / Payme.uz** - платёжные системы (в разработке)

## 📦 Установка и настройка

### Требования

- Node.js 18+
- Docker и Docker Compose
- Git
- PostgreSQL 16+ (через Docker)
- Redis 7+ (через Docker)

### 1. Клонирование репозитория

```bash
git clone https://github.com/iakadirov/edubaza-platform.git
cd edubaza-platform
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните необходимые переменные:

```env
# Database
DATABASE_URL="postgresql://edubaza:your_password@localhost:5432/edubaza?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="your-jwt-secret-key-min-32-characters-long-change-this"
JWT_EXPIRES_IN=30d

# SMS OTP (Eskiz.uz)
ESKIZ_EMAIL=your-email@example.com
ESKIZ_PASSWORD=your-eskiz-password
ESKIZ_API_URL=https://notify.eskiz.uz/api

# AI Generation (Google Gemini)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# AI Generation (OpenAI) - Optional
OPENAI_API_KEY=your-openai-api-key-here

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_BOT_USERNAME=your-bot-username
```

### 4. Запуск Docker контейнеров

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379
- Redis Commander (GUI) на порту 8081

### 5. Инициализация базы данных

```bash
# Создание таблиц
docker exec -i edubaza_postgres psql -U edubaza -d edubaza < prisma/init.sql

# Применение миграций профиля (если требуется)
docker exec -i edubaza_postgres psql -U edubaza -d edubaza < migration_add_profile.sql
```

### 6. Запуск проекта

```bash
npm run dev
```

Откройте http://localhost:3000 в браузере.

## 📁 Структура проекта

```
edubaza-platform/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Авторизация (send-otp, verify-otp)
│   │   ├── user/                 # Профиль пользователя
│   │   ├── worksheet/            # Генерация worksheet
│   │   ├── subjects/             # Управление предметами
│   │   └── test/                 # Тестовые endpoints
│   ├── login/                    # Страница логина
│   ├── dashboard/                # Личный кабинет
│   ├── profile/                  # Редактирование профиля
│   ├── worksheet/                # Просмотр worksheet
│   └── admin/                    # Админ панель
├── components/                   # React компоненты
│   ├── admin/                    # Админ компоненты
│   ├── worksheet/                # Компоненты worksheet
│   └── ui/                       # UI компоненты
├── lib/                          # Утилиты и хелперы
│   ├── redis.ts                  # Redis клиент
│   ├── sms.ts                    # Eskiz.uz интеграция
│   ├── jwt.ts                    # JWT токены
│   ├── db-users.ts               # Работа с пользователями
│   ├── db.ts                     # Database helpers
│   └── auth-middleware.ts        # Middleware для защиты роутов
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Схема базы данных
│   └── init.sql                  # Начальная инициализация
├── public/                       # Статические файлы
│   ├── worksheets/               # Сгенерированные PDF
│   └── uploads/                  # Загруженные файлы (gitignored)
├── docs/                         # Документация
├── docker-compose.yml            # Docker конфигурация
└── .env.example                  # Пример переменных окружения
```

## 🔐 Аутентификация

### Процесс входа

1. Пользователь вводит номер телефона (+998XXXXXXXXX)
2. Система отправляет 6-значный OTP код через Eskiz.uz
3. OTP код сохраняется в Redis с TTL 5 минут
4. Пользователь вводит OTP код
5. Система проверяет код в Redis
6. Система создаёт JWT токен и сохраняет в localStorage
7. Пользователь перенаправляется на dashboard

### Rate Limiting

- **3 попытки** отправки OTP за 15 минут на один номер
- **5 попыток** проверки OTP (затем нужно запросить новый код)
- Реализовано через Redis с автоматическим истечением

## 📡 API Endpoints

### Аутентификация

#### POST `/api/auth/send-otp`
Отправка OTP кода на номер телефона.

**Request:**
```json
{
  "phone": "+998901234567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP код отправлен на ваш номер",
  "data": {
    "phone": "+998901234567",
    "expiresIn": 300
  }
}
```

**Errors:**
- `400` - Неверный формат номера
- `429` - Превышен лимит попыток (rate limit)
- `500` - Ошибка отправки SMS

#### POST `/api/auth/verify-otp`
Проверка OTP кода и получение JWT токена.

**Request:**
```json
{
  "phone": "+998901234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Авторизация успешна",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "phone": "+998901234567",
      "name": "Иван Иванов",
      "specialty": "MATHEMATICS",
      "school": "Школа №1",
      "subscriptionPlan": "FREE"
    }
  }
}
```

**Errors:**
- `400` - Неверный формат данных
- `401` - Неверный OTP код
- `404` - OTP код истёк или не найден

### Профиль пользователя

#### GET `/api/user/profile`
Получение профиля пользователя (требуется авторизация).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "+998901234567",
    "name": "Иван Иванов",
    "email": "user@example.com",
    "specialty": "MATHEMATICS",
    "school": "Школа №1",
    "subscriptionPlan": "FREE",
    "limits": {
      "worksheetsPerMonth": 10,
      "templatesAccess": 3,
      "taskTypesAccess": 15
    },
    "usage": {
      "worksheetsThisMonth": 5,
      "lastResetAt": "2025-12-01T00:00:00Z"
    }
  }
}
```

#### PUT `/api/user/profile`
Обновление профиля пользователя (требуется авторизация).

**Request:**
```json
{
  "name": "Иван Иванов",
  "specialty": "MATHEMATICS",
  "school": "Школа №1",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Профиль обновлён",
  "data": { /* updated user object */ }
}
```

### Тестовые endpoints

Доступны только в режиме разработки:

- `GET /api/test/db` - проверка PostgreSQL
- `GET /api/test/redis` - проверка Redis
- `GET /api/test/eskiz` - проверка Eskiz.uz API
- `GET /api/test/gemini` - проверка Google Gemini API
- `GET /api/test/all` - проверка всех сервисов

## 📊 База данных

### Схема пользователя (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  specialty "TeacherSpecialty",
  school VARCHAR(200),
  "subscriptionPlan" "SubscriptionPlan" DEFAULT 'FREE',
  "subscriptionExpiresAt" TIMESTAMP,
  "subscriptionStartedAt" TIMESTAMP,
  limits JSONB DEFAULT '{"worksheetsPerMonth": 10, "templatesAccess": 3, "taskTypesAccess": 15}',
  usage JSONB DEFAULT '{"worksheetsThisMonth": 0, "lastResetAt": null}',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "lastLoginAt" TIMESTAMP,
  "isActive" BOOLEAN DEFAULT true
);
```

### Энумы

```sql
CREATE TYPE "TeacherSpecialty" AS ENUM (
  'PRIMARY_SCHOOL', 'MATHEMATICS', 'RUSSIAN_LANGUAGE',
  'UZBEK_LANGUAGE', 'ENGLISH_LANGUAGE', 'PHYSICS',
  'CHEMISTRY', 'BIOLOGY', 'GEOGRAPHY', 'HISTORY',
  'LITERATURE', 'INFORMATICS', 'PHYSICAL_EDUCATION',
  'MUSIC', 'ART', 'OTHER'
);

CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'SCHOOL');
```

## 👤 Профиль пользователя

### Специальности (16 вариантов)

- Начальные классы (1-4) - `PRIMARY_SCHOOL`
- Математика - `MATHEMATICS`
- Русский язык - `RUSSIAN_LANGUAGE`
- Узбекский язык - `UZBEK_LANGUAGE`
- Английский язык - `ENGLISH_LANGUAGE`
- Физика - `PHYSICS`
- Химия - `CHEMISTRY`
- Биология - `BIOLOGY`
- География - `GEOGRAPHY`
- История - `HISTORY`
- Литература - `LITERATURE`
- Информатика - `INFORMATICS`
- Физическая культура - `PHYSICAL_EDUCATION`
- Музыка - `MUSIC`
- Изобразительное искусство - `ART`
- Другое - `OTHER`

### Тарифные планы

- **FREE** - 10 worksheets в месяц, доступ к 3 шаблонам, 15 типов заданий
- **PRO** - 100 worksheets в месяц, доступ к 10 шаблонам, 30 типов заданий
- **SCHOOL** - Безлимит для школ (все функции)

## 🛠️ Команды разработки

```bash
# Разработка
npm run dev          # Запуск dev сервера на порту 3000
npm run build        # Сборка продакшн версии
npm run start        # Запуск продакшн сервера
npm run lint         # Проверка ESLint

# Docker
docker-compose up -d           # Запустить контейнеры
docker-compose down            # Остановить контейнеры
docker-compose logs -f         # Просмотр логов

# База данных
docker exec -it edubaza_postgres psql -U edubaza -d edubaza  # Подключиться к PostgreSQL
docker exec -it edubaza_redis redis-cli                       # Подключиться к Redis

# Миграции
npx prisma migrate dev         # Создать и применить миграцию
npx prisma migrate deploy      # Применить миграции в продакшне
npx prisma studio              # Открыть Prisma Studio
```

## ⚠️ Известные ограничения

### 1. Windows + Docker + Prisma
Prisma ORM не работает корректно на Windows с Docker из-за проблем аутентификации. Используется временное решение через `docker exec` для SQL запросов в файле `lib/db-users.ts`. На Linux/Mac и в продакшне Prisma будет работать нормально.

**Обходное решение:**
```typescript
// lib/db-users.ts использует executeSql() вместо Prisma
export async function findUserByPhone(phone: string) {
  const result = await executeSql(
    `SELECT * FROM users WHERE phone = $1`,
    [phone]
  );
  return result.rows[0] || null;
}
```

### 2. localStorage для JWT
В текущей версии JWT токен хранится в `localStorage`. Для продакшна рекомендуется использовать `httpOnly` cookies для большей безопасности.

### 3. SMS шаблон
Используется временный шаблон от Mediazona.uz. После утверждения собственного шаблона в Eskiz.uz нужно обновить текст сообщения в `lib/sms.ts`.

### 4. Загрузка изображений
Для загрузки логотипов и баннеров предметов используется локальное хранилище файлов в папке `public/uploads/subjects/`.

**Важно:** Папка `public/uploads/` добавлена в `.gitignore`, поэтому загруженные файлы не попадут в репозиторий. На продакшн-сервере рекомендуется использовать CDN или облачное хранилище (Cloudinary, AWS S3).

## 🎯 Прогресс разработки

### ✅ Sprint 1 (Завершён)

- ✅ SMS OTP авторизация через Eskiz.uz
- ✅ JWT токены и защищённые роуты
- ✅ Профиль пользователя (имя, специальность, школа)
- ✅ Rate limiting (3 попытки за 15 минут)
- ✅ Страницы: login, dashboard, profile
- ✅ Docker setup (PostgreSQL + Redis)
- ✅ Database migrations
- ✅ Auto-loading user data from API

### ✅ Sprint 2 (Завершён)

- ✅ Форма генерации worksheet
- ✅ Интеграция с Gemini API для генерации заданий
- ✅ Создание PDF шаблонов
- ✅ Библиотека тем по предметам (132 темы по математике 4 класс)
- ✅ Topic autocomplete с поиском
- ✅ Custom topic creation
- ✅ Chat-style интерфейс для A/B тестирования
- ✅ История генераций пользователя
- ✅ Админ панель

### 🚧 Sprint 3 (В работе)

- [ ] Главная страница (Landing)
- [ ] Система подписок и оплаты
- [ ] Интеграция с Click.uz / Payme.uz

### 📅 Будущие спринты

**Phase 2: Игровые материалы**
- [ ] BOSHQOTIRMALAR (Кроссворды, викторины, игры)

**Phase 3: Планирование и контент**
- [ ] DARS REJASI (Планирование уроков)
- [ ] TAQDIMOTLAR (Презентации PowerPoint)

**Phase 4: Расширенные функции**
- [ ] Коммуникация с родителями
- [ ] Анализ работ учеников
- [ ] Внеклассные мероприятия

**Инфраструктура:**
- [ ] Экспорт в Word/PDF
- [ ] Мобильная версия (PWA)
- [ ] Аналитика и статистика
- [ ] AI тьютор чатбот

## 🔄 Git Workflow

### Сохранение изменений

```bash
# Посмотреть что изменилось
git status

# Добавить все изменения
git add .

# Создать коммит
git commit -m "feat: Add new feature"

# Загрузить на GitHub
git push
```

### Примеры коммитов

```bash
git commit -m "feat: Add worksheet generation form"
git commit -m "fix: Fix specialty display in dashboard"
git commit -m "docs: Update README with API documentation"
git commit -m "refactor: Improve error handling in auth"
git commit -m "style: Update UI colors and spacing"
```

## 📝 Дополнительные ресурсы

- [API Документация](api/)
- [Deployment Guide](deployment/)
- [Security Incident Response](../SECURITY-INCIDENT-RESPONSE.md)
- [Architecture Documentation](architecture/)

---

**Последнее обновление:** 2025-12-05

🤖 Generated with [Claude Code](https://claude.com/claude-code)
