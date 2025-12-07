# Database Migrations for Library Module

This directory contains SQL migration files for the library module.

## Migration Files

1. **001_create_library_tables.sql** - Creates all library tables and indexes
2. **002_insert_library_categories.sql** - Inserts initial demo categories

## How to Apply Migrations

### On Local (Docker PostgreSQL)

```bash
# Navigate to project root
cd /c/Claude/Edubaza/edubaza-platform

# Apply migration 001
cat ../docs/migrations/001_create_library_tables.sql | docker exec -i postgres psql -U postgres -d edubaza

# Apply migration 002
cat ../docs/migrations/002_insert_library_categories.sql | docker exec -i postgres psql -U postgres -d edubaza
```

### On Production (Direct PostgreSQL)

**⚠️ WARNING: Test on local first before applying to production!**

```bash
# SSH into production server
ssh user@your-server.com

# Apply migration 001
psql -U your_db_user -d edubaza_production -f /path/to/001_create_library_tables.sql

# Apply migration 002
psql -U your_db_user -d edubaza_production -f /path/to/002_insert_library_categories.sql
```

## Verification

After applying migrations, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'library_%';

-- Check categories count
SELECT COUNT(*) FROM library_categories;
-- Should return: 23 categories

-- Check root categories
SELECT name_uz, slug, category_type
FROM library_categories
WHERE parent_category_id IS NULL;
-- Should return: 5 root categories
```

## Rollback (if needed)

To rollback the migrations:

```sql
-- Drop tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS library_downloads CASCADE;
DROP TABLE IF EXISTS library_reading_progress CASCADE;
DROP TABLE IF EXISTS library_bookmarks CASCADE;
DROP TABLE IF EXISTS library_books CASCADE;
DROP TABLE IF EXISTS library_categories CASCADE;

-- Drop enums
DROP TYPE IF EXISTS library_category_type CASCADE;
DROP TYPE IF EXISTS book_access CASCADE;
DROP TYPE IF EXISTS book_type CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_library_updated_at() CASCADE;
```

## Migration History

| Migration | Date       | Description                          | Status |
|-----------|------------|--------------------------------------|--------|
| 001       | 2025-12-08 | Create library tables                | ✅ Ready |
| 002       | 2025-12-08 | Insert initial categories            | ✅ Ready |

## Next Steps

After applying these migrations:

1. ✅ Create TypeScript types (`types/library.ts`)
2. ✅ Create database helper functions (`lib/db-library.ts`)
3. ✅ Create storage helper functions (`lib/storage-library.ts`)
4. ✅ Create API endpoints (`app/api/library/...`)
