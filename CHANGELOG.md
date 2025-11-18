# Changelog

## [Unreleased] - 2025-11-18

### Added

#### User Profile Subscription Information Display
- Added comprehensive subscription plan information display on user profile page
- Shows current plan name (Uzbek and Russian), monthly price
- Displays usage statistics with progress bars for worksheets per month
- Shows all plan limits: worksheets per month, saved worksheets, watermark status
- Added visual features list with icons (checkmarks for enabled, X for disabled)
- Shows "Faol" (Active) / "Faol emas" (Inactive) status for each feature

**Files changed:**
- `app/profile/page.tsx` - Added `planInfo` and `usage` interfaces, created subscription info card
- `app/api/user/profile/route.ts` - Added database queries for plan info and monthly worksheet count

#### Dynamic Subscription Plan Management in Admin Panel
- Admin panel now loads subscription plans dynamically from database
- Subscription plan dropdown shows format: "Название (Nomi) - ЦЕНА сум"
- Only active plans from database are available for selection

**Files changed:**
- `app/admin/users/[id]/page.tsx` - Added `fetchSubscriptionPlans()` function, dynamic select dropdown
- `app/api/admin/users/[id]/route.ts` - Added database validation for subscription plans

### Changed

#### PDF Filename Generation - Human-Readable Format
- PDF files now download with human-readable Uzbek format names
- Format: `tema_chorak_hafta_sinf_predmet.pdf`
- Example: "2-chorak_4-sinf_Matematika.pdf" instead of "worksheet_uuid.pdf"
- Added Cyrillic-to-Latin transliteration for cross-platform compatibility
- Added ASCII-safe subject names dictionary

**Files changed:**
- `lib/worksheet-title.ts` - Added `subjectNamesLatin` dictionary, enhanced `generatePdfFileName()` with transliteration
- `app/worksheet/[id]/page.tsx` - Fixed `handleDownloadPDF()` to parse Content-Disposition header
- `app/api/worksheets/[id]/pdf/route.ts` - Updated to send proper Content-Disposition header with generated filename

#### Subscription Plan System Unification
- Unified all subscription plan references to use database as single source of truth
- Removed all hardcoded plan lists (`FREE`, `STANDARD`, `PREMIUM`, `PRO`, `SCHOOL`)
- Database plans: `BEMINNAT`, `USTOZ`, `KATTA_USTOZ`, `MAKTAB`
- Watermark logic now queries `show_watermark` field from database instead of hardcoded plan list
- Admins always see PDFs without watermarks

**Files changed:**
- `app/api/worksheets/[id]/pdf/route.ts` - Replaced hardcoded plan check with database query
- `app/api/admin/users/[id]/route.ts` - Removed hardcoded plan validation, added database validation
- `app/admin/users/[id]/page.tsx` - Made subscription plan dropdown dynamic

#### Features Display UI Improvement
- Changed features display from "true/false" text to visual icons
- Green checkmark icon (solar:check-circle-bold-duotone) + "Faol" for enabled features
- Gray X icon (solar:close-circle-bold-duotone) + "Faol emas" for disabled features
- Each feature displayed in individual rounded card for better visual hierarchy

**Files changed:**
- `app/profile/page.tsx` - Updated features rendering to use icons and status text

### Fixed

#### PDF Download Filename Issue
- **Root cause:** Client-side code was hard-coding `a.download = 'worksheet_${params.id}.pdf'`, completely ignoring server's Content-Disposition header
- **Solution:** Updated client code to extract filename from Content-Disposition header using regex
- **Fallback:** Falls back to UUID-based name if header parsing fails
- Tried multiple approaches before finding root cause:
  1. Added debug logging to server-side filename generation (confirmed it was working)
  2. Tried RFC 2231 UTF-8 encoding format (didn't help - problem was client-side)
  3. Added Cyrillic transliteration (kept for compatibility, but didn't solve the issue)
  4. Finally discovered and fixed client-side code override

**Files changed:**
- `app/worksheet/[id]/page.tsx` - Lines 95-132, modified `handleDownloadPDF()` function

#### Subscription Plan Update Error in Admin Panel
- Fixed error when admins tried to update user subscription plans
- Issue was caused by hardcoded plan validation not matching database plans
- Now validates against actual active plans in database

**Files changed:**
- `app/api/admin/users/[id]/route.ts` - Lines 157-167, added database plan validation

### Database Changes

#### Subscription Plans Structure
All plans now include:
- `features` (JSONB): AI Yordamchi, Kengaytirilgan statistika, Prioritet qo'llab-quvvatlash
- `limits` (JSONB): worksheetsPerMonth, savedWorksheets, taskTypesAccess, templatesAccess
- `show_watermark` (BOOLEAN): Whether to show watermark on PDFs

**Current Plans:**
- **BEMINNAT** (Бесплатный): 0 сум/мес, 3 worksheets, 10 saved, watermark, no features
- **USTOZ** (Учитель): 49,000 сум/мес, 20 worksheets, 50 saved, no watermark, AI + stats
- **KATTA_USTOZ** (Старший учитель): 99,000 сум/мес, 100 worksheets, 200 saved, no watermark, all features
- **MAKTAB** (Школа): 499,000 сум/мес, unlimited, unlimited, no watermark, all features

#### User Migration
- All users previously on `FREE` plan migrated to `BEMINNAT` plan

### Technical Implementation Details

#### Content-Disposition Header Parsing
```typescript
const contentDisposition = response.headers.get('Content-Disposition');
let filename = `worksheet_${params.id}.pdf`; // fallback

if (contentDisposition) {
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
  if (filenameMatch && filenameMatch[1]) {
    filename = filenameMatch[1];
  }
}
```

#### Cyrillic-to-Latin Transliteration Map
Comprehensive transliteration for Russian/Uzbek Cyrillic characters:
- а→a, б→b, в→v, г→g, д→d, е/ё→e, ж→j, з→z
- и→i, й→y, к→k, л→l, м→m, н→n, о→o, п→p
- р→r, с→s, т→t, у→u, ф→f, х→h, ц→ts, ч→ch
- ш→sh, щ→shch, ы→y, э→e, ю→yu, я→ya
- Special: ъ/ь removed, non-ASCII characters removed

#### PostgreSQL Queries for Plan Info
```sql
SELECT plan_code, name_uz, name_ru, price_uzs, features, limits, show_watermark
FROM subscription_plans
WHERE plan_code = 'USER_PLAN' AND is_active = TRUE
LIMIT 1
```

#### Monthly Worksheet Usage Count
```sql
SELECT COUNT(*) FROM worksheets
WHERE "userId" = 'USER_ID'
AND "generatedAt" >= DATE_TRUNC('month', CURRENT_DATE)
```

### User Interface Changes

#### Profile Page Subscription Section
- Gradient card header with plan name and price
- Icon-based limits display with progress bars
- Visual features list with checkmarks/X marks
- Color-coded status indicators (green for active, gray for inactive)

#### Admin User Edit Page
- Dynamic subscription plan dropdown populated from database
- Plan display format: "Название (Nomi) - ЦЕНА сум"
- Current plan shown below dropdown for reference

## Key Files Modified

### Frontend Components
- `app/profile/page.tsx` - User profile with subscription info display
- `app/admin/users/[id]/page.tsx` - Admin user edit page with dynamic plans
- `app/worksheet/[id]/page.tsx` - Worksheet page with fixed PDF download

### Backend API Routes
- `app/api/user/profile/route.ts` - User profile endpoint with plan info
- `app/api/admin/users/[id]/route.ts` - Admin user edit endpoint with plan validation
- `app/api/worksheets/[id]/pdf/route.ts` - PDF generation with dynamic watermark logic

### Utility Libraries
- `lib/worksheet-title.ts` - PDF filename generation with transliteration

## Testing Notes

All features tested and confirmed working:
- ✅ PDF files download with correct Uzbek format names (e.g., "2-chorak_4-sinf_Matematika.pdf")
- ✅ Cyrillic text transliterated to Latin for filename compatibility
- ✅ Admin panel loads subscription plans from database
- ✅ Admin can update user subscription plans successfully
- ✅ User profile shows current plan with limits and usage
- ✅ Progress bars display worksheet usage correctly
- ✅ Features display with proper icons and status text
- ✅ Watermark logic queries database for each plan
- ✅ Admins never see watermarks on PDFs
