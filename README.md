# 🎓 EduBaza.uz Platform - AI Worksheet Generator

O'qituvchilar uchun AI yordamida ish varaqlari yaratish platformasi.

## 🏗️ Arxitektura

**Гибридный подход:** Модульный монолит с готовностью к микросервисам

```
edubaza-platform/
├── src/
│   ├── modules/          # Бизнес-модули (готовы к выделению в микросервисы)
│   │   ├── auth/         # Авторизация (JWT, SMS OTP)
│   │   ├── worksheets/   # Генерация worksheet'ов (AI + PDF)
│   │   ├── payments/     # Платежи (Click.uz, Payme.uz)
│   │   ├── subscriptions # Управление подписками
│   │   └── templates/    # Шаблоны PDF
│   └── shared/           # Общая инфраструктура
│       ├── infrastructure/ # DB, Redis, Queue, External APIs
│       ├── middleware/     # Auth, Rate Limit, Error handling
│       ├── utils/          # Helper functions
│       └── config/         # Конфигурация
├── components/           # React компоненты
├── app/                  # Next.js App Router
└── prisma/               # Database schema
```

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

```bash
# Скопируйте .env.example в .env.local
cp .env.example .env.local

# Отредактируйте .env.local и заполните необходимые ключи
```

### 3. Запуск Docker (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 4. Миграция базы данных

```bash
npm run prisma:migrate
```

### 5. Запуск dev сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

### Frontend
- **Next.js 14** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Hook Form + Zod** - Forms & validation

### Backend
- **Next.js API Routes** - REST API
- **Prisma ORM** - Database ORM
- **PostgreSQL 15** - Database
- **Redis 7** - Cache & Queue
- **BullMQ** - Background jobs

### AI & PDF
- **Google Gemini Pro** - AI generation
- **Puppeteer** - PDF generation

### Integrations
- **Eskiz.uz** - SMS OTP
- **Click.uz** - Payment gateway
- **Payme.uz** - Payment gateway

## 🗄️ Database Schema

См. [prisma/schema.prisma](./prisma/schema.prisma)

Основные модели:
- **User** - Пользователи
- **Worksheet** - Сгенерированные worksheet'ы
- **Template** - Шаблоны PDF
- **Payment** - Платежи
- **CurriculumTopic** - Темы по предметам

## 🔧 Доступные скрипты

```bash
# Development
npm run dev              # Запуск dev сервера
npm run build            # Production build
npm run start            # Production сервер
npm run lint             # ESLint
npm run type-check       # TypeScript проверка

# Prisma
npm run prisma:generate  # Генерация Prisma Client
npm run prisma:migrate   # Создание миграции
npm run prisma:studio    # Prisma Studio (GUI)
npm run prisma:seed      # Заполнение тестовыми данными
npm run prisma:reset     # Сброс БД
```

## 🔑 Переменные окружения

См. [.env.example](./.env.example)

Обязательные:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT secret key
- `GEMINI_API_KEY` - Google Gemini API key
- `ESKIZ_EMAIL` & `ESKIZ_PASSWORD` - Eskiz.uz credentials

## 🎯 Модули

### 🔐 Auth Module
- SMS OTP авторизация через Eskiz.uz
- JWT токены (httpOnly cookies)
- Middleware для защиты routes

### 📝 Worksheets Module
- AI генерация заданий через Gemini
- PDF генерация через Puppeteer
- Управление worksheet'ами
- Queue system для асинхронной обработки

### 💳 Payments Module
- Интеграция с Click.uz
- Интеграция с Payme.uz
- Webhook обработка
- История платежей

### 🎫 Subscriptions Module
- Управление тарифными планами (FREE/PRO/SCHOOL)
- Проверка лимитов
- Auto-renewal

### 🎨 Templates Module
- Библиотека PDF шаблонов
- Premium шаблоны

## 📐 Архитектурные принципы

1. **Модульность** - каждый модуль изолирован
2. **Слоистая архитектура** - API → Service → Repository
3. **Готовность к микросервисам** - модули легко выделяются
4. **Type Safety** - строгая типизация TypeScript
5. **Error Handling** - централизованная обработка ошибок

## 🔄 Workflow: Генерация worksheet

```
User Input (form)
  → API Route Handler
    → Worksheet Service
      → AI Generator Service (Gemini)
        → Worksheet Repository (save to DB)
          → PDF Queue (BullMQ)
            → PDF Generator Service (Puppeteer)
              → File Storage
                → DB Update (pdf_url)
```

## 🚀 Deployment

### Development
```bash
docker-compose up -d
npm run dev
```

### Production
```bash
# 1. Build
npm run build

# 2. Start production server
npm run start

# Or with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Документация

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Детальная архитектура
- [TECHNICAL_SPECIFICATION.md](../TECHNICAL_SPECIFICATION.md) - Техническая спецификация
- [TASKS_CHECKLIST.md](../TASKS_CHECKLIST.md) - Задачи и прогресс

## 🛣️ Roadmap

### MVP (1 месяц)
- [x] Инфраструктура setup
- [ ] Auth module (SMS OTP)
- [ ] Worksheets generator
- [ ] PDF generation
- [ ] Payments (Click/Payme)

### Phase 2 (3 месяца)
- [ ] Test generator
- [ ] Library module
- [ ] PWA
- [ ] Analytics dashboard

### Phase 3 (6 месяцев)
- [ ] Mobile app
- [ ] Team collaboration
- [ ] AI tutor chatbot

## 📄 License

Private - All rights reserved

## 📞 Contact

- Email: support@edubaza.uz
- Website: https://edubaza.uz

---

**Made with ❤️ for O'zbekiston teachers**
