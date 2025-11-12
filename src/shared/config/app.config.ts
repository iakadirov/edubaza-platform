/**
 * App Configuration
 * Централизованная конфигурация приложения
 */

export const appConfig = {
  app: {
    name: process.env.APP_NAME || 'EduBaza.uz',
    url: process.env.APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  fileStorage: {
    pdfPath: process.env.PDF_STORAGE_PATH || './public/worksheets',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },

  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION === 'true',
    enablePayments: process.env.ENABLE_PAYMENTS === 'true',
    enableAiGeneration: process.env.ENABLE_AI_GENERATION === 'true',
  },

  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

export type AppConfig = typeof appConfig;
