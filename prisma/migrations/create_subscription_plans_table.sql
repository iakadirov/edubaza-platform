-- Create subscription_plans table for managing subscription tiers
CREATE TABLE subscription_plans (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  plan_code VARCHAR(50) NOT NULL UNIQUE,
  name_uz VARCHAR(100) NOT NULL,
  name_ru VARCHAR(100),
  price_uzs INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_watermark BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on plan_code for fast lookups
CREATE INDEX idx_subscription_plans_code ON subscription_plans(plan_code);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Insert default subscription plans based on requirements
INSERT INTO subscription_plans (plan_code, name_uz, name_ru, price_uzs, limits, show_watermark, display_order) VALUES
('BEMINNAT', 'Beminnat', 'Бесплатный', 0,
  '{"worksheetsPerMonth": 3, "taskTypesAccess": 3, "templatesAccess": 3, "maxResourcesAndServices": 3}'::jsonb,
  true, 1),
('USTOZ', 'Ustoz', 'Учитель', 49000,
  '{"worksheetsPerMonth": 20, "taskTypesAccess": 20, "templatesAccess": 20, "maxResourcesAndServices": 20}'::jsonb,
  false, 2),
('KATTA_USTOZ', 'Katta ustoz', 'Старший учитель', 99000,
  '{"worksheetsPerMonth": 100, "taskTypesAccess": 100, "templatesAccess": 100, "maxResourcesAndServices": 100}'::jsonb,
  false, 3),
('MAKTAB', 'Maktab', 'Школа', 499000,
  '{"worksheetsPerMonth": -1, "taskTypesAccess": -1, "templatesAccess": -1, "maxResourcesAndServices": -1}'::jsonb,
  false, 4);

-- Add comment to explain -1 means unlimited
COMMENT ON TABLE subscription_plans IS 'Subscription plan configurations. Limit value of -1 means unlimited.';
