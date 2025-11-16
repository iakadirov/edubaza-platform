# Changelog

Barcha muhim oʻzgarishlar ushbu faylda hujjatlashtiriladi.

## [Unreleased] - 2024-11-14

### Added - Qoʻshilgan

#### Tayyor Topshiriqlar Tizimi (Predefined Tasks System)
- **Database Schema**: `PredefinedTask` modeli yaratildi
  - TaskType enum: TEST, PROBLEM, QUESTION, FILL_BLANK
  - Difficulty enum: EASY, MEDIUM, HARD
  - JSON content maydoni turli xil topshiriq turlari uchun moslashuvchan saqlash
  - Avtomatik `usageCount` kuzatuv tizimi
  - Mavzu va daraja boʻyicha indekslar

- **Admin Panel** (`/admin/tasks`):
  - Topshiriqlarni koʻrish va boshqarish interfeysi
  - Fanlar, sinflar, turlar, qiyinlik darajasi boʻyicha filtrlash
  - Sahifalash (20 ta topshiriq/sahifa)
  - Statistika dashboard (umumiy topshiriqlar, aktiv topshiriqlar, foydalanish soni)
  - Topshiriqlarni faollashtirish/oʻchirish funksiyasi

- **Topshiriq Yaratish/Tahrirlash Formlari**:
  - `/admin/tasks/new` - Yangi topshiriq qoʻshish
  - `/admin/tasks/[id]` - Mavjud topshiriqni tahrirlash
  - Topshiriq turiga qarab dinamik maydonlar:
    - TEST: variantlar va toʻgʻri javob
    - PROBLEM: yechim qadamlari va javob
    - QUESTION: ochiq javob formati
    - FILL_BLANK: boʻshliqlar va toʻgʻri javoblar massivi

- **API Endpoints**:
  - `GET /api/admin/tasks` - Topshiriqlar roʻyxati va statistika
  - `POST /api/admin/tasks` - Yangi topshiriq yaratish
  - `GET /api/admin/tasks/[id]` - Bitta topshiriqni olish
  - `PUT /api/admin/tasks/[id]` - Topshiriqni yangilash
  - `DELETE /api/admin/tasks/[id]` - Topshiriqni oʻchirish

- **Database Helper Functions** (`lib/db-predefined-tasks.ts`):
  - `getPredefinedTasks()` - Filtrlash va sahifalash bilan
  - `getRandomPredefinedTasks()` - Tasodifiy tanlash va foydalanish kuzatuvi
  - `createPredefinedTask()` - Yangi topshiriq yaratish
  - `updatePredefinedTask()` - Topshiriqni yangilash
  - `deletePredefinedTask()` - Topshiriqni oʻchirish
  - `getPredefinedTasksStats()` - Statistika olish

### Changed - Oʻzgartirilgan

#### Topshiriq Generatsiya Mantiq
- **100% Database-First Strategy**: Topshiriqlar avval ma'lumotlar bazasidan olinadi
- Prioritet tartibi:
  1. Ma'lumotlar bazasidan tayyor topshiriqlar (100%)
  2. OpenAI API (fallback, agar database boʻsh boʻlsa)
  3. Mock data (eng oxirgi variant)
- `lib/openai.ts` faylida `generateTasksFromDatabase()` funksiyasi qoʻshildi
- Avtomatik `usageCount` yangilash tanlangan topshiriqlar uchun

#### Database Configuration
- **Port Change**: PostgreSQL container 5432 → 5433 portga koʻchirildi
- `DATABASE_URL` yangilandi: `postgresql://edubaza:test123@localhost:5433/edubaza?schema=public`
- `.env` va `.env.local` fayllari yangilandi

#### Docker Container
- **Container Name**: `edubaza_postgres` → `edubaza_postgres_new`
- Barcha kodda container reference'lar yangilandi:
  - `lib/db-users.ts` (3 ta joyda)
  - `app/api/worksheets/route.ts`
  - `app/api/worksheets/[id]/route.ts`
  - `app/api/worksheets/generate/route.ts`

### Fixed - Tuzatilgan

#### PostgreSQL Port Conflict Issue
- **Muammo**: Ikki PostgreSQL server bir xil portda (5432) ishlab, authentication xatoliklarga olib keldi
  - Native Windows PostgreSQL (boshqa parol)
  - Docker edubaza_postgres container
- **Yechim**:
  - Yangi container 5433 portda yaratildi
  - Eski container toʻxtatildi
  - Barcha connection string'lar yangilandi
  - Prisma schema qayta push qilindi

#### Prisma Migration Authentication Error
- **Muammo**: `npx prisma migrate dev` authentication xatosi
- **Yechim**: Manual SQL migration fayl yaratildi va Docker orqali qoʻllanildi:
  ```bash
  cat migration.sql | docker exec -i edubaza_postgres_new psql -U edubaza -d edubaza
  npx prisma generate
  ```

#### Container Reference Errors
- **Muammo**: Worksheet va user API'lar eski `edubaza_postgres` container nomiga murojaat qilmoqda
- **Yechim**: Barcha `edubaza_postgres` occurence'lar `edubaza_postgres_new` ga almashtirildi

### Technical Improvements - Texnik Yaxshilanishlar

- **Type Safety**: TaskType va Difficulty uchun TypeScript enum'lar
- **Validation**: API level'da to'liq validatsiya
- **Indexing**: Tez qidiruv uchun database indekslar
- **Soft Delete**: `isActive` flag orqali ma'lumotlarni saqlash
- **Usage Tracking**: Har bir topshiriq necha marta ishlatilganini kuzatish
- **Quality Rating**: 1-10 skaladagi sifat reytingi
- **Flexible Content**: JSON field turli xil topshiriq formatlari uchun

### Security - Xavfsizlik

- Server-side validation barcha input'lar uchun
- SQL injection himoyasi (Prisma ORM orqali)
- Type-safe database operations
- Container isolation (Docker)

### Documentation - Hujjatlashtirish

- To'liq texnik hujjatlar yaratildi
- Barcha muammolar va yechimlar hujjatlashtirildi
- API endpoint spetsifikatsiyalari
- Database sxema tushuntirishlari
- Deployment ko'rsatmalari

---

## Development Notes - Ishlab Chiqish Eslatmalari

### Database Migration Commands
```bash
# Schema push (development)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Manual migration (if needed)
cat migration.sql | docker exec -i edubaza_postgres_new psql -U edubaza -d edubaza
```

### Docker Commands
```bash
# Create new PostgreSQL container
docker run -d --name edubaza_postgres_new \
  -e POSTGRES_USER=edubaza \
  -e POSTGRES_PASSWORD=test123 \
  -e POSTGRES_DB=edubaza \
  -p 5433:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Check container logs
docker logs edubaza_postgres_new

# Execute SQL
docker exec edubaza_postgres_new psql -U edubaza -d edubaza -c "SELECT * FROM predefined_tasks LIMIT 5;"
```

### Testing
```bash
# Test database connection
node test-db.js

# Run development server
npm run dev
```

---

## Future Improvements - Kelajakdagi Yaxshilanishlar

1. **AI Integration**: OpenAI/Gemini orqali topshiriqlarni to'ldirish
2. **Bulk Import**: Excel/CSV dan ko'p miqdorda topshiriqlarni import qilish
3. **Topic Mapping**: CurriculumTopic bilan to'liq integratsiya
4. **Quality Control**: Topshiriqlarni ko'rib chiqish va tasdiqlash tizimi
5. **Analytics**: Qaysi topshiriqlar eng ko'p ishlatilishini tahlil qilish
6. **A/B Testing**: Turli topshiriq variantlarini sinash
7. **Teacher Contributions**: O'qituvchilar o'z topshiriqlarini qo'shishi mumkin bo'lishi
