// Site Settings Types

export interface GeneralSettings {
  'site.name': string;
  'site.description': string;
  'site.contactEmail': string;
  'site.contactPhone': string;
  'site.address': string;
  'site.timezone': string;
  'site.defaultLanguage': string;
}

export interface PDFSettings {
  'pdf.watermarkEnabled': boolean;
  'pdf.watermarkMode': 'grid' | 'diagonal' | 'center';
  'pdf.watermarkOpacity': number;
  'pdf.footerText': string;
}

export interface AIGeminiSettings {
  'ai.gemini.apiKey': string;
  'ai.gemini.model': string;
  'ai.gemini.temperature': number;
  'ai.gemini.maxTokens': number;
  'ai.gemini.enabled': boolean;
}

export interface AIOpenAISettings {
  'ai.openai.apiKey': string;
  'ai.openai.model': string;
  'ai.openai.temperature': number;
  'ai.openai.maxTokens': number;
  'ai.openai.enabled': boolean;
}

export interface SMSSettings {
  'sms.eskiz.email': string;
  'sms.eskiz.password': string;
  'sms.eskiz.token': string;
  'sms.eskiz.enabled': boolean;
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  limits: {
    generationsPerMonth: number; // -1 = unlimited
    savedWorksheets: number; // -1 = unlimited
    aiModels: string[];
    prioritySupport: boolean;
  };
}

export interface SubscriptionSettings {
  'subscription.plans': {
    free: SubscriptionPlan;
    basic: SubscriptionPlan;
    premium: SubscriptionPlan;
    pro: SubscriptionPlan;
  };
  'subscription.trialDays': number;
}

export interface ContentSettings {
  'content.maxImageSizeMB': number;
  'content.allowedImageFormats': string[];
  'content.maxTasksPerWorksheet': number;
  'content.availableSubjects': string[];
  'content.availableGrades': number[];
  'content.availableTaskTypes': string[];
  'content.availableDifficulties': string[];
}

export interface SecuritySettings {
  'security.jwtExpirationHours': number;
  'security.maxLoginAttempts': number;
  'security.lockoutDurationMinutes': number;
  'security.passwordMinLength': number;
  'security.passwordRequireUppercase': boolean;
  'security.passwordRequireNumbers': boolean;
  'security.passwordRequireSpecialChars': boolean;
}

export interface AnalyticsSettings {
  'analytics.googleAnalyticsId': string;
  'analytics.yandexMetricaId': string;
  'analytics.sentryDsn': string;
  'analytics.enableErrorLogging': boolean;
}

export interface MaintenanceSettings {
  'maintenance.enabled': boolean;
  'maintenance.message': string;
  'maintenance.allowedIPs': string[];
}

export interface BackupSettings {
  'backup.autoBackupEnabled': boolean;
  'backup.frequency': 'daily' | 'weekly';
  'backup.retentionDays': number;
}

// Combined type
export type SiteSettings =
  & GeneralSettings
  & PDFSettings
  & AIGeminiSettings
  & AIOpenAISettings
  & SMSSettings
  & SubscriptionSettings
  & ContentSettings
  & SecuritySettings
  & AnalyticsSettings
  & MaintenanceSettings
  & BackupSettings;

// Database model
export interface SiteSettingDB {
  id: string;
  settingKey: keyof SiteSettings;
  settingValue: any;
  category: 'general' | 'pdf' | 'ai' | 'sms' | 'subscription' | 'content' | 'security' | 'analytics' | 'maintenance' | 'backup';
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

// Category groups for UI
export const SETTING_CATEGORIES = {
  general: 'Общие настройки',
  pdf: 'PDF и водяные знаки',
  ai: 'AI интеграции',
  sms: 'SMS интеграция',
  subscription: 'Подписки и тарифы',
  content: 'Контент',
  security: 'Безопасность',
  analytics: 'Аналитика',
  maintenance: 'Обслуживание',
  backup: 'Резервное копирование'
} as const;
