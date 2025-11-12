/**
 * Common Types
 * Общие типы для всего приложения
 */

import { SubscriptionPlan, WorksheetStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Re-export Prisma enums
 */
export { SubscriptionPlan, WorksheetStatus, PaymentMethod, PaymentStatus };

/**
 * User Limits
 */
export interface UserLimits {
  worksheetsPerMonth: number;
  templatesAccess: number;
  taskTypesAccess: number;
}

/**
 * User Usage
 */
export interface UserUsage {
  worksheetsThisMonth: number;
  lastResetAt: string | null;
}

/**
 * Subject
 */
export interface Subject {
  id: string;
  nameUz: string;
  nameRu: string;
}

/**
 * Grade Type
 */
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/**
 * Task Type
 */
export interface TaskType {
  id: string;
  nameUz: string;
  isPremium: boolean;
}

/**
 * Difficulty Level
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Tone/Style
 */
export type Tone = 'formal' | 'friendly' | 'playful';
