-- Initial database setup script for EduBaza.uz
-- This script runs automatically when PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE edubaza_db TO edubaza;

-- Set timezone
SET timezone = 'Asia/Tashkent';
