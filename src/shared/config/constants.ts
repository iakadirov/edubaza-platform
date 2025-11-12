/**
 * Application Constants
 */

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Bepul',
    price: 0,
    limits: {
      worksheetsPerMonth: 10,
      templatesAccess: 3,
      taskTypesAccess: 15,
    },
  },
  PRO: {
    name: 'Pro',
    price: 49000, // UZS
    limits: {
      worksheetsPerMonth: 100,
      templatesAccess: 10,
      taskTypesAccess: 30,
    },
  },
  SCHOOL: {
    name: 'Maktab',
    price: 299000, // UZS
    limits: {
      worksheetsPerMonth: -1, // unlimited
      templatesAccess: -1, // unlimited
      taskTypesAccess: -1, // unlimited
    },
  },
} as const;

// Subjects (O'zbekiston maktab dasturi)
export const SUBJECTS = [
  { id: 'math', nameUz: 'Matematika', nameRu: 'Математика' },
  { id: 'physics', nameUz: 'Fizika', nameRu: 'Физика' },
  { id: 'chemistry', nameUz: 'Kimyo', nameRu: 'Химия' },
  { id: 'biology', nameUz: 'Biologiya', nameRu: 'Биология' },
  { id: 'geography', nameUz: 'Geografiya', nameRu: 'География' },
  { id: 'history', nameUz: 'Tarix', nameRu: 'История' },
  { id: 'literature', nameUz: 'Adabiyot', nameRu: 'Литература' },
  { id: 'uzbek', nameUz: "O'zbek tili", nameRu: 'Узбекский язык' },
  { id: 'russian', nameUz: 'Rus tili', nameRu: 'Русский язык' },
  { id: 'english', nameUz: 'Ingliz tili', nameRu: 'Английский язык' },
  { id: 'informatics', nameUz: 'Informatika', nameRu: 'Информатика' },
] as const;

// Grades
export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

// Task Types
export const TASK_TYPES = [
  { id: 'multiple_choice', nameUz: "Ko'p tanlovli", isPremium: false },
  { id: 'true_false', nameUz: "To'g'ri/Noto'g'ri", isPremium: false },
  { id: 'fill_blank', nameUz: "Bo'sh joyni to'ldiring", isPremium: false },
  { id: 'short_answer', nameUz: 'Qisqa javob', isPremium: false },
  { id: 'matching', nameUz: 'Moslashtiring', isPremium: true },
  { id: 'ordering', nameUz: 'Tartibga keltiring', isPremium: true },
  { id: 'essay', nameUz: 'Insho/Esse', isPremium: true },
  { id: 'calculation', nameUz: 'Hisoblash', isPremium: false },
  { id: 'diagram', nameUz: 'Diagramma', isPremium: true },
  { id: 'definition', nameUz: "Ta'rif bering", isPremium: false },
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { id: 'easy', nameUz: 'Oson', weight: 1 },
  { id: 'medium', nameUz: "O'rta", weight: 2 },
  { id: 'hard', nameUz: 'Qiyin', weight: 3 },
] as const;

// Tone/Style
export const TONES = [
  { id: 'formal', nameUz: 'Rasmiy' },
  { id: 'friendly', nameUz: "Do'stona" },
  { id: 'playful', nameUz: "O'yinli" },
] as const;

// API Response Codes
export const API_RESPONSES = {
  SUCCESS: { code: 200, message: 'Muvaffaqiyatli' },
  CREATED: { code: 201, message: 'Yaratildi' },
  BAD_REQUEST: { code: 400, message: "Noto'g'ri so'rov" },
  UNAUTHORIZED: { code: 401, message: 'Avtorizatsiya talab qilinadi' },
  FORBIDDEN: { code: 403, message: 'Ruxsat berilmagan' },
  NOT_FOUND: { code: 404, message: 'Topilmadi' },
  LIMIT_EXCEEDED: { code: 429, message: 'Limit oshdi' },
  SERVER_ERROR: { code: 500, message: 'Server xatosi' },
} as const;

// OTP Settings
export const OTP_CONFIG = {
  length: 6,
  expiresIn: 300, // 5 minutes (seconds)
  maxAttempts: 3,
} as const;

// Pagination
export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;
