# EduBaza.uz - AI-Powered Worksheet Generator

> Платформа для автоматической генерации учебных материалов для учителей Узбекистана

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)

## 📋 О проекте

EduBaza.uz - это платформа для учителей Узбекистана, которая помогает автоматически генерировать учебные материалы (worksheets) с использованием искусственного интеллекта. Проект упрощает создание заданий, тестов и дидактических материалов для всех предметов школьной программы.

### ✨ Возможности (Sprint 1)

- 🔐 **Авторизация через SMS OTP** - безопасный вход без паролей
- 👤 **Профиль учителя** - ФИО, специальность, школа
- 📱 **Поддержка узбекских номеров** - автоматическое форматирование +998
- 🎨 **Современный интерфейс** - адаптивный дизайн с Tailwind CSS
- 🔒 **JWT токены** - защищённые API endpoints
- ⚡ **Rate Limiting** - защита от спама (3 попытки за 15 минут)

## 🚀 Технологии

### Frontend
- **Next.js 14** (App Router) - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация

### Backend
- **Next.js API Routes** - серверная логика
- **PostgreSQL 16** - основная база данных
- **Redis 7** - кэширование и rate limiting
- **Prisma ORM** - работа с базой данных

### Внешние сервисы
- **Eskiz.uz** - отправка SMS
- **Google Gemini API** - генерация заданий (в разработке)

## 📦 Установка и запуск

### Требования

- Node.js 18+
- Docker и Docker Compose
- Git

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
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Eskiz.uz SMS API
ESKIZ_EMAIL=your_email@example.com
ESKIZ_PASSWORD=your_password
ESKIZ_API_URL=https://notify.eskiz.uz/api

# Google Gemini API (опционально)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Запуск Docker контейнеров

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379

### 5. Инициализация базы данных

```bash
# Создание таблиц
docker exec -i edubaza_postgres psql -U edubaza -d edubaza < prisma/init.sql

# Применение миграций профиля
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
│   │   └── test/                 # Тестовые endpoints
│   ├── login/                    # Страница логина
│   ├── dashboard/                # Личный кабинет
│   └── profile/                  # Редактирование профиля
├── lib/                          # Утилиты и хелперы
│   ├── redis.ts                  # Redis клиент
│   ├── sms.ts                    # Eskiz.uz интеграция
│   ├── jwt.ts                    # JWT токены
│   ├── db-users.ts               # Работа с пользователями
│   └── auth-middleware.ts        # Middleware для защиты роутов
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Схема базы данных
│   └── init.sql                  # Начальная инициализация
├── docker-compose.yml            # Docker конфигурация
└── .env.example                  # Пример переменных окружения
```

## 🔐 Аутентификация

### Процесс входа

1. Пользователь вводит номер телефона (+998XXXXXXXXX)
2. Система отправляет 6-значный OTP код через Eskiz.uz
3. Пользователь вводит OTP код
4. Система создаёт JWT токен и сохраняет в localStorage
5. Пользователь перенаправляется на dashboard

### API Endpoints

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

#### GET `/api/user/profile`
Получение профиля пользователя (требуется авторизация).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### PUT `/api/user/profile`
Обновление профиля пользователя (требуется авторизация).

**Request:**
```json
{
  "name": "Иван Иванов",
  "specialty": "MATHEMATICS",
  "school": "Школа №1"
}
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

- **FREE** - 10 worksheets в месяц, доступ к 3 шаблонам
- **PRO** - 100 worksheets в месяц, доступ ко всем шаблонам
- **SCHOOL** - Безлимит для школ

## 🛠️ Разработка

### Доступные команды

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
```

### Тестовые endpoints

Доступны по адресу http://localhost:3000/test:

- `/api/test/db` - проверка PostgreSQL
- `/api/test/redis` - проверка Redis
- `/api/test/eskiz` - проверка Eskiz.uz API
- `/api/test/gemini` - проверка Google Gemini API
- `/api/test/all` - проверка всех сервисов

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

## ⚠️ Известные ограничения

### 1. Windows + Docker + Prisma
Prisma ORM не работает на Windows с Docker из-за проблем аутентификации. Используется временное решение через `docker exec` для SQL запросов. На Linux/Mac и в продакшне Prisma будет работать нормально.

### 2. localStorage для JWT
В текущей версии JWT токен хранится в `localStorage`. Для продакшна рекомендуется использовать `httpOnly` cookies для большей безопасности.

### 3. SMS шаблон
Используется временный шаблон от Mediazona.uz. После утверждения собственного шаблона в Eskiz.uz нужно обновить текст сообщения в [lib/sms.ts](lib/sms.ts):

```typescript
export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  const message = `EduBaza.uz platformasiga kirish uchun tasdiqlash kodi: ${otp}`;
  return sendSMS(phone, message);
}
```

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

### 🚧 Sprint 2 (Планируется)

- [ ] Главная страница (Landing)
- [ ] Форма генерации worksheet
- [ ] Интеграция с Gemini API для генерации заданий
- [ ] Создание PDF шаблонов
- [ ] История генераций пользователя
- [ ] Библиотека тем по предметам

### 📅 Будущие спринты

- [ ] Система подписок и оплаты (Click.uz, Payme.uz)
- [ ] Библиотека готовых шаблонов
- [ ] Экспорт в Word/PDF
- [ ] Мобильная версия (PWA)
- [ ] Админ панель
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

## 🤝 Вклад в проект

Если вы хотите внести вклад в проект:

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'feat: Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект является частной разработкой EduBaza.uz.

## 👨‍💻 Автор

**Ibrohim Kadirov**
- GitHub: [@iakadirov](https://github.com/iakadirov)
- Repository: [edubaza-platform](https://github.com/iakadirov/edubaza-platform)

## 📞 Контакты

- Email: support@edubaza.uz
- Website: https://edubaza.uz

---

<div align="center">

**EduBaza.uz** - Делаем образование доступнее!

🤖 Generated with [Claude Code](https://claude.com/claude-code)

</div>
