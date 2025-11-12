-- Add TeacherSpecialty enum
CREATE TYPE "TeacherSpecialty" AS ENUM (
  'PRIMARY_SCHOOL',
  'MATHEMATICS',
  'RUSSIAN_LANGUAGE',
  'UZBEK_LANGUAGE',
  'ENGLISH_LANGUAGE',
  'PHYSICS',
  'CHEMISTRY',
  'BIOLOGY',
  'GEOGRAPHY',
  'HISTORY',
  'LITERATURE',
  'INFORMATICS',
  'PHYSICAL_EDUCATION',
  'MUSIC',
  'ART',
  'OTHER'
);

-- Add specialty and school columns to users table
ALTER TABLE users ADD COLUMN specialty "TeacherSpecialty";
ALTER TABLE users ADD COLUMN school VARCHAR(200);
