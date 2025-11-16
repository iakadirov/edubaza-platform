# Changelog

Barcha muhim oʻzgarishlar ushbu faylda hujjatlashtiriladi.

## [2024-11-16] - Unified Admin Panel & System Settings

### Added - Qoʻshilgan

#### 🎨 Yagona Admin Panel (Unified Admin Panel)
- **Yagona admin layout yaratildi** (`/admin/layout.tsx`)
  - Barcha admin bo'limlar uchun bitta sidebar navigatsiya
  - Avtomatik autentifikatsiya va avtorizatsiya tekshiruvi
  - Foydalanuvchi rolini tekshirish (ADMIN, SUPER_ADMIN)
  - Zamonaviy va izchil dizayn

- **Admin Dashboard** (`/admin/page.tsx`)
  - Barcha bo'limlarga tez kirish uchun kartochkalar
  - Statistika ko'rinishi (sinflar, fanlar, mavzular, materiallar)
  - Tez navigatsiya:
    - Tuzilma (Sinflar, Fanlar, Mavzular)
    - Kontent Kutubxonasi (Topshiriqlar, Testlar, Materiallar)
    - Foydalanuvchilarni boshqarish
    - Tizim sozlamalari

- **Foydalanuvchilarni Boshqarish** (`/admin/users`)
  - Barcha foydalanuvchilar ro'yxati va filtrlash
  - Rol bo'yicha filtrlash (O'quvchi, O'qituvchi, Admin)
  - Ism yoki telefon raqami bo'yicha qidirish
  - Tasdiqlash bilan foydalanuvchi rolini o'zgartirish
  - Har bir foydalanuvchi turi uchun statistika kartalari
  - API endpointlar:
    - `GET /api/admin/users` - Barcha foydalanuvchilarni olish
    - `PUT /api/admin/users/[id]/role` - Foydalanuvchi rolini yangilash

#### ⚙️ Tizim Sozlamalari Moduli (System Settings)
- **Keng qamrovli sozlamalar tizimi** (`/admin/settings`)
  - 10 kategoriyada 51 ta sozlash parametri
  - Real vaqtda o'zgarishlarni kuzatish
  - Saqlash/Bekor qilish funksiyasi
  - PostgreSQL da sozlamalarni saqlash

- **Sozlamalar Kategoriyalari:**
  1. **Umumiy Sozlamalar** (`general.*`)
     - Sayt nomi, tavsifi
     - Aloqa ma'lumotlari (email, telefon, manzil)
     - Vaqt mintaqasi sozlamalari
     - Til sozlamalari

  2. **PDF Sozlamalar** (`pdf.*`)
     - Watermark yoqish/o'chirish
     - Watermark rejimi (matn/rasm)
     - Watermark shaffoflik darajasi
     - Footer matnini sozlash
     - Jonli ko'rinish

  3. **AI Xizmatlari** (`ai.*`)
     - Gemini API integratsiyasi (kalit, model, harorat, maksimal tokenlar)
     - OpenAI API integratsiyasi (kalit, model, harorat, maksimal tokenlar)
     - Ko'rsatish/yashirish funksiyasi bilan xavfsiz kalit saqlash

  4. **SMS Integratsiya** (`sms.*`)
     - Eskiz.uz integratsiya
     - Email/parol autentifikatsiya
     - Avtomatik yangilanadigan token boshqaruvi
     - Xavfsiz ma'lumotlar saqlash

  5. **Obuna va Narxlar** (`subscription.*`)
     - To'rt darajali tizim (Bepul, Oddiy, Premium, Pro)
     - Moslashuvchan narxlash
     - Har bir reja uchun funksiya chegaralari
     - Sinov muddatini sozlash

  6. **Kontent Sozlamalar** (`content.*`)
     - Maksimal rasm hajmi chegaralari
     - Har bir ishchi vaqtdagi maksimal topshiriqlar
     - Mavjud fanlar va sinflar
     - Kontent moderatsiya sozlamalari

  7. **Xavfsizlik** (`security.*`)
     - JWT token amal qilish muddati
     - Maksimal kirish urinishlari
     - Hisob bloklash muddati
     - Parol siyosati (uzunlik, murakkablik)

  8. **Analitika** (`analytics.*`)
     - Google Analytics integratsiya
     - Yandex Metrica integratsiya
     - Sentry xatoliklarni kuzatish
     - Xatoliklarni qayd qilish tugmasi

  9. **Texnik Xizmat Rejimi** (`maintenance.*`)
     - Sayt texnik xizmatini yoqish/o'chirish
     - Maxsus texnik xizmat xabari
     - Ruxsat etilgan IP manzillari
     - Ogohlantirish signallari

  10. **Zaxira Sozlamalari** (`backup.*`)
      - Avtomatik zaxiralashni yoqish/o'chirish
      - Zaxiralash chastotasi
      - Saqlash muddati

- **Ma'lumotlar bazasi sxemasi:**
  ```sql
  CREATE TABLE site_settings (
    id VARCHAR(36) PRIMARY KEY,
    "settingKey" VARCHAR(255) UNIQUE NOT NULL,
    "settingValue" JSONB NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" VARCHAR(36) REFERENCES users(id)
  );
  ```

- **API Endpointlari:**
  - `GET /api/admin/settings` - Barcha sozlamalarni olish
  - `PUT /api/admin/settings` - Sozlamalarni yangilash (to'plam)

- **Yordamchi Funksiyalar** (`lib/settings.ts`):
  - `getAllSettings()` - Barcha sozlamalarni kalit-qiymat juftlari sifatida olish
  - `getSettingsByCategory()` - Kategoriya bo'yicha filtrlash
  - `getSetting()` - Bitta sozlamani olish
  - `updateSetting()` - Bitta sozlamani yangilash
  - `updateSettings()` - To'plam yangilash
  - `getSettingsWithMetadata()` - To'liq metama'lumotlar bilan olish

### Changed - O'zgartirilgan

#### 🎨 UI/UX Yaxshilanishlar
- **Sozlamalar Sahifasi Qayta Dizayni**
  - Mustaqil sidebar'dan gorizontal tabalarga o'tkazildi
  - Yagona admin layout'ga integratsiya qilindi
  - Yaxshilangan saqlash/bekor qilish ish oqimi
  - Saqlanmagan o'zgarishlar uchun yaxshi vizual fikr-mulohaza

- **Global Kontrast Tuzatishlar** (`app/globals.css`)
  - Yaxshiroq o'qilishi uchun matn kontrastini oshirdi
  - Kam kontrastli input placeholder'larni tuzatdi
  - O'chirilgan input ko'rinishini yaxshiladi
  - Platforma bo'ylab kulrang matn ranglarini to'q qildi
  ```css
  .text-gray-500 { color: #374151 !important; }
  .text-gray-600 { color: #1f2937 !important; }
  ```

#### 📱 Worksheet Ko'rinishi
- **Web Forma Tuzilishi** - PDF tartibiga mos keltirildi
  - Takroriy topshiriq sarlavhalarini olib tashlandi
  - Toza topshiriq raqam belgilari
  - Izchil oraliq va tipografiya

- **Shrift O'lchami Yaxshilanishlari**
  - Yaxshiroq o'qilishi uchun 10px dan 14-16px ga oshirildi
  - Kattaroq checkboxlar (8px → 16px)
  - Balandroq input maydonlari (15px → 32px)

#### 🔧 Texnik Yaxshilanishlar
- **Bufer O'lchami Oshirish**
  - API yo'nalishlarida 1MB dan 50MB ga oshirildi
  - Katta base64 rasmlarni qo'llab-quvvatlash (1.5MB+)
  - Qo'llandi:
    - `/api/worksheets/generate`
    - `/api/content/items`
    - Barcha admin API endpointlari

### Technical Details - Texnik Tafsilotlar

#### Fayl Tuzilishi
```
app/
├── admin/
│   ├── layout.tsx           # Sidebar bilan yagona admin layout
│   ├── page.tsx             # Admin dashboard
│   ├── users/
│   │   └── page.tsx         # Foydalanuvchilarni boshqarish
│   ├── settings/
│   │   └── page.tsx         # Tizim sozlamalari
│   ├── content/             # Kontent kutubxonasi (mavjud)
│   └── structure/           # Tuzilma boshqaruvi (mavjud)
├── api/
│   └── admin/
│       ├── settings/
│       │   └── route.ts     # Sozlamalar API
│       └── users/
│           ├── route.ts     # Foydalanuvchilar ro'yxati API
│           └── [id]/
│               └── role/
│                   └── route.ts  # Foydalanuvchi rolini yangilash
components/
└── admin/
    └── settings/
        ├── GeneralSettingsPanel.tsx
        ├── PDFSettingsPanel.tsx
        ├── AISettingsPanel.tsx
        ├── SMSSettingsPanel.tsx
        ├── SubscriptionSettingsPanel.tsx
        ├── ContentSettingsPanel.tsx
        ├── SecuritySettingsPanel.tsx
        ├── AnalyticsSettingsPanel.tsx
        ├── MaintenanceSettingsPanel.tsx
        └── BackupSettingsPanel.tsx
lib/
└── settings.ts              # Sozlamalar yordamchi funksiyalari
types/
└── settings.ts              # TypeScript tip ta'riflari
scripts/
└── create-site-settings.sql # Ma'lumotlar bazasi sxemasi va standartlar
```

#### Xavfsizlik
- Barcha admin yo'nalishlari JWT autentifikatsiya bilan himoyalangan
- Rol asosida kirish nazorati (faqat ADMIN, SUPER_ADMIN)
- Ko'rinish almashinishi bilan xavfsiz parol/API kalit saqlash
- SQL injection himoyasi parametrlashtirilgan so'rovlar orqali

#### Holat Boshqaruvi
- Sozlamalarda real vaqtda o'zgarishlarni kuzatish
- Optimistik UI yangilanishlar
- Bekor qilishda orqaga qaytarish
  - Kutilayotgan o'zgarishlar ko'rsatkichi

### Migration Notes - Migratsiya Eslatmalari
- Sozlamalar jadvalini yaratish uchun `scripts/create-site-settings.sql` ni ishga tushiring
- Standart sozlamalar avtomatik to'ldiriladi
- Mavjud funksiyalar uchun ma'lumotlar migratsiyasi talab qilinmaydi
- Sozlamalar ixtiyoriy - sozlanmagan bo'lsa standartlar ishlatiladi

### Future Integration Points - Kelajakdagi Integratsiya Nuqtalari
Sozlamalar quyidagilarga integratsiya qilish uchun tayyor:
- PDF watermark generatsiya
- AI xizmat chaqiruvlari (Gemini, OpenAI)
- SMS bildirishnomalar (Eskiz)
- Obuna chegaralarini ta'minlash
- Analitika kuzatuv
- Texnik xizmat rejimi middleware

### Breaking Changes - Buzuvchi O'zgarishlar
Yo'q - Barcha o'zgarishlar qo'shimcha va orqaga mos.

### Notes - Eslatmalar
- Mavjud funksiyalarga sozlamalar integratsiyasi keyingi bosqichga kechiktirildi
- Barcha sozlamalar hozirda saqlangan, lekin hali faol ishlatilmaydi
- Sozlamalar context/provider yaratish kelajakdagi yangilanish uchun rejalashtirilgan

---

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
