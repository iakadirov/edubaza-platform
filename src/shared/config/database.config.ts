/**
 * Database Configuration
 */

export const databaseConfig = {
  url: process.env.DATABASE_URL || '',

  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
  },

  // Query logging
  logging: process.env.NODE_ENV === 'development',
} as const;

export type DatabaseConfig = typeof databaseConfig;
