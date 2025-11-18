-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "settingKey" VARCHAR(255) UNIQUE NOT NULL,
  "settingValue" JSONB NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedBy" VARCHAR(36) REFERENCES users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings("settingKey");
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- Insert default settings
INSERT INTO site_settings ("settingKey", "settingValue", category, description) VALUES
-- General Settings
('site.name', '"EduBaza.uz"', 'general', 'Platform name'),
('site.description', '"Ta''lim materiallari platformasi"', 'general', 'Platform description'),
('site.contactEmail', '"info@edubaza.uz"', 'general', 'Contact email'),
('site.contactPhone', '"+998901234567"', 'general', 'Contact phone'),
('site.address', '"Toshkent, O''zbekiston"', 'general', 'Physical address'),
('site.timezone', '"Asia/Tashkent"', 'general', 'Timezone'),
('site.defaultLanguage', '"uz"', 'general', 'Default language'),

-- PDF & Watermark Settings
('pdf.watermarkEnabled', 'true', 'pdf', 'Enable/disable watermark on PDFs'),
('pdf.watermarkMode', '"diagonal"', 'pdf', 'Watermark mode: grid, diagonal, center'),
('pdf.watermarkOpacity', '0.1', 'pdf', 'Watermark opacity (0-1)'),
('pdf.footerText', '"© {year} EduBaza.uz - Barcha huquqlar himoyalangan"', 'pdf', 'Footer text for PDFs'),

-- AI Integration - Gemini
('ai.gemini.apiKey', '""', 'ai', 'Gemini API Key'),
('ai.gemini.model', '"gemini-2.0-flash-exp"', 'ai', 'Gemini model name'),
('ai.gemini.temperature', '1.0', 'ai', 'Gemini temperature'),
('ai.gemini.maxTokens', '8000', 'ai', 'Gemini max tokens'),
('ai.gemini.enabled', 'true', 'ai', 'Enable/disable Gemini'),

-- AI Integration - OpenAI
('ai.openai.apiKey', '""', 'ai', 'OpenAI API Key'),
('ai.openai.model', '"gpt-4"', 'ai', 'OpenAI model name'),
('ai.openai.temperature', '0.7', 'ai', 'OpenAI temperature'),
('ai.openai.maxTokens', '4000', 'ai', 'OpenAI max tokens'),
('ai.openai.enabled', 'false', 'ai', 'Enable/disable OpenAI'),

-- SMS Integration - Eskiz
('sms.eskiz.email', '""', 'sms', 'Eskiz email'),
('sms.eskiz.password', '""', 'sms', 'Eskiz password'),
('sms.eskiz.token', '""', 'sms', 'Eskiz token (auto-updated)'),
('sms.eskiz.enabled', 'false', 'sms', 'Enable/disable Eskiz SMS'),

-- Subscription & Pricing
('subscription.plans', '{
  "free": {
    "name": "Free",
    "price": 0,
    "limits": {
      "generationsPerMonth": 10,
      "savedWorksheets": 5,
      "aiModels": ["gemini"],
      "prioritySupport": false
    }
  },
  "basic": {
    "name": "Basic",
    "price": 50000,
    "limits": {
      "generationsPerMonth": 50,
      "savedWorksheets": 50,
      "aiModels": ["gemini", "openai"],
      "prioritySupport": false
    }
  },
  "premium": {
    "name": "Premium",
    "price": 100000,
    "limits": {
      "generationsPerMonth": 200,
      "savedWorksheets": 200,
      "aiModels": ["gemini", "openai"],
      "prioritySupport": true
    }
  },
  "pro": {
    "name": "Pro",
    "price": 200000,
    "limits": {
      "generationsPerMonth": -1,
      "savedWorksheets": -1,
      "aiModels": ["gemini", "openai"],
      "prioritySupport": true
    }
  }
}', 'subscription', 'Subscription plans configuration'),
('subscription.trialDays', '7', 'subscription', 'Trial period in days'),

-- Content Settings
-- Note: availableSubjects and availableGrades removed - now managed via database
-- through subjects.is_visible and topics table (grade_number + is_visible)
('content.maxImageSizeMB', '5', 'content', 'Maximum image upload size in MB'),
('content.allowedImageFormats', '["image/jpeg", "image/png", "image/gif", "image/webp"]', 'content', 'Allowed image formats'),
('content.maxTasksPerWorksheet', '20', 'content', 'Maximum tasks per worksheet'),
('content.allowedTaskTypes', '["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "FILL_BLANKS", "MATCHING", "ESSAY"]', 'content', 'Available task types'),
('content.availableDifficulties', '["EASY", "MEDIUM", "HARD"]', 'content', 'Available difficulty levels'),
('content.allowUsersToDeleteWorksheets', 'true', 'content', 'Allow users to delete their worksheets'),

-- Security & Privacy
('security.jwtExpirationHours', '24', 'security', 'JWT token expiration in hours'),
('security.maxLoginAttempts', '5', 'security', 'Maximum login attempts before lockout'),
('security.lockoutDurationMinutes', '15', 'security', 'Account lockout duration in minutes'),
('security.passwordMinLength', '6', 'security', 'Minimum password length'),
('security.passwordRequireUppercase', 'false', 'security', 'Require uppercase in password'),
('security.passwordRequireNumbers', 'false', 'security', 'Require numbers in password'),
('security.passwordRequireSpecialChars', 'false', 'security', 'Require special characters in password'),

-- Analytics
('analytics.googleAnalyticsId', '""', 'analytics', 'Google Analytics Tracking ID'),
('analytics.yandexMetricaId', '""', 'analytics', 'Yandex Metrica ID'),
('analytics.sentryDsn', '""', 'analytics', 'Sentry DSN for error tracking'),
('analytics.enableErrorLogging', 'true', 'analytics', 'Enable error logging'),

-- Maintenance
('maintenance.enabled', 'false', 'maintenance', 'Enable maintenance mode'),
('maintenance.message', '"Tizim texnik xizmat ko''rsatish rejimida. Tez orada qaytamiz!"', 'maintenance', 'Maintenance mode message'),
('maintenance.allowedIPs', '[]', 'maintenance', 'IP addresses allowed during maintenance'),

-- Backup
('backup.autoBackupEnabled', 'true', 'backup', 'Enable automatic backups'),
('backup.frequency', '"daily"', 'backup', 'Backup frequency: daily, weekly'),
('backup.retentionDays', '30', 'backup', 'Number of days to keep backups')

ON CONFLICT ("settingKey") DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON site_settings TO edubaza;
