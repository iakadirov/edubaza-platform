/**
 * Конфигурация для генератора рабочих листов
 */

// Навыки (Skills) - универсальные навыки, не привязанные к предметам
export const SKILLS = [
  {
    id: 'logical_thinking',
    nameUz: 'Mantiqiy fikrlash',
    descriptionUz: 'Mantiqiy zanjirlar, sabab-oqibat aloqalari',
    icon: 'solar:graph-bold-duotone',
    color: 'purple',
  },
  {
    id: 'critical_thinking',
    nameUz: 'Tanqidiy fikrlash',
    descriptionUz: 'Axborotni baholash, dalillar keltirish',
    icon: 'solar:lightbulb-bold-duotone',
    color: 'orange',
  },
  {
    id: 'creative_thinking',
    nameUz: 'Ijodiy fikrlash',
    descriptionUz: 'Nostandart masalalar, ijodiy yechimlar',
    icon: 'solar:palette-bold-duotone',
    color: 'pink',
  },
  {
    id: 'text_comprehension',
    nameUz: 'Matn bilan ishlash',
    descriptionUz: 'Oʻqish va tushunish, axborotni ajratib olish',
    icon: 'solar:document-text-bold-duotone',
    color: 'blue',
  },
  {
    id: 'mathematical_thinking',
    nameUz: 'Matematik fikrlash',
    descriptionUz: 'Naqshlar, fazoviy fikrlash, baholash',
    icon: 'solar:calculator-bold-duotone',
    color: 'indigo',
  },
  {
    id: 'scientific_method',
    nameUz: 'Ilmiy usul',
    descriptionUz: 'Gipoteza, kuzatish, xulosa chiqarish',
    icon: 'solar:test-tube-bold-duotone',
    color: 'teal',
  },
];

// Форматы заданий (Formats)
export const FORMATS = [
  {
    id: 'dts_prep',
    nameUz: 'DTS tayyorgarlik',
    descriptionUz: 'Davlat test sinoviga tayyorgarlik formati',
    icon: 'solar:diploma-bold-duotone',
    color: 'green',
  },
  {
    id: 'pisa_format',
    nameUz: 'PISA formatida',
    descriptionUz: 'Xalqaro PISA standartlari',
    icon: 'solar:global-bold-duotone',
    color: 'blue',
  },
  {
    id: 'olympiad',
    nameUz: 'Olimpiada',
    descriptionUz: 'Yuqori qiyinlikdagi olimpiada topshiriqlari',
    icon: 'solar:medal-ribbons-star-bold-duotone',
    color: 'yellow',
  },
  {
    id: 'practical',
    nameUz: 'Amaliy topshiriqlar',
    descriptionUz: 'Real hayotdan misollar bilan',
    icon: 'solar:widget-5-bold-duotone',
    color: 'orange',
  },
];

// Источники заданий
export const TASK_SOURCES = [
  {
    value: 'TEXTBOOK',
    label: 'Darsliklar asosida',
    description: 'Rasmiy darsliklardan topshiriqlar',
    icon: 'solar:book-bold-duotone',
  },
  {
    value: 'AI',
    label: 'AI generatsiyasi',
    description: 'Sun\'iy intellekt tomonidan yaratilgan',
    icon: 'solar:magic-stick-3-bold-duotone',
  },
  {
    value: 'MIX',
    label: 'Aralash',
    description: '50% darslik + 50% AI',
    icon: 'solar:shuffle-bold-duotone',
  },
];

// Уровни сложности
export const DIFFICULTY_LEVELS = [
  { value: 'EASY', label: 'Oson', icon: 'solar:smile-circle-bold-duotone', color: 'green' },
  { value: 'MEDIUM', label: 'Oʻrta', icon: 'solar:emoji-funny-square-bold-duotone', color: 'yellow' },
  { value: 'HARD', label: 'Qiyin', icon: 'solar:fire-bold-duotone', color: 'red' },
];

// Типы заданий (обновленный список)
export const TASK_TYPES = [
  {
    value: 'SINGLE_CHOICE',
    label: 'Bir tanlov',
    description: 'Bitta toʻgʻri javob',
    icon: 'solar:check-circle-bold-duotone',
    category: 'basic',
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: 'Koʻp tanlov',
    description: 'Bir nechta toʻgʻri javob',
    icon: 'solar:checklist-bold-duotone',
    category: 'basic',
  },
  {
    value: 'TRUE_FALSE',
    label: 'Toʻgʻri/Notoʻgʻri',
    description: 'Tasdiq yoki rad etish',
    icon: 'solar:verified-check-bold-duotone',
    category: 'basic',
  },
  {
    value: 'SHORT_ANSWER',
    label: 'Qisqa javob',
    description: 'Bir necha soʻzda javob',
    icon: 'solar:pen-new-square-bold-duotone',
    category: 'basic',
  },
  {
    value: 'FILL_BLANKS',
    label: 'Boʻsh joyni toʻldirish',
    description: 'Tushirib qoldirilgan soʻzlarni topish',
    icon: 'solar:text-square-bold-duotone',
    category: 'basic',
  },
  {
    value: 'MATCHING',
    label: 'Moslashtirish',
    description: 'Ikkita roʻyxatni bogʻlash',
    icon: 'solar:link-bold-duotone',
    category: 'advanced',
  },
  {
    value: 'ORDERING',
    label: 'Tartibga keltirish',
    description: 'Toʻgʻri ketma-ketlikni tuzish',
    icon: 'solar:sort-vertical-bold-duotone',
    category: 'advanced',
  },
  {
    value: 'CALCULATION',
    label: 'Hisoblash',
    description: 'Matematik hisob-kitoblar',
    icon: 'solar:calculator-bold-duotone',
    category: 'advanced',
  },
  {
    value: 'DEFINITION',
    label: 'Taʻrif berish',
    description: 'Tushunchaga taʻrif yozish',
    icon: 'solar:book-bookmark-bold-duotone',
    category: 'advanced',
  },
  {
    value: 'ESSAY',
    label: 'Kengaytirilgan javob',
    description: 'Batafsil yozma javob',
    icon: 'solar:document-text-bold-duotone',
    category: 'advanced',
  },
];

// Языки (пока только узбекский)
export const LANGUAGES = [
  {
    value: 'uz-latn',
    label: 'Oʻzbekcha (Lotin)',
    icon: 'solar:flag-bold-duotone',
    enabled: true,
  },
  {
    value: 'uz-cyrl',
    label: 'Ўзбекча (Кирилл)',
    icon: 'solar:flag-bold-duotone',
    enabled: false,
  },
  {
    value: 'ru',
    label: 'Русский',
    icon: 'solar:flag-bold-duotone',
    enabled: false,
  },
];

// Стили/Тон
export const TONES = [
  {
    value: 'FORMAL',
    label: 'Rasmiy',
    description: 'Ilmiy, rasmiy uslub',
    icon: 'solar:square-academic-cap-bold-duotone',
  },
  {
    value: 'FRIENDLY',
    label: 'Doʻstona',
    description: 'Yoqimli, tushunarli til',
    icon: 'solar:chat-round-smile-bold-duotone',
  },
  {
    value: 'PLAYFUL',
    label: 'Oʻyinli',
    description: 'Qiziqarli, oʻyin elementlari bilan',
    icon: 'solar:gameboy-bold-duotone',
  },
];

// Контекст
export const CONTEXTS = [
  {
    value: 'THEORETICAL',
    label: 'Nazariy',
    description: 'Asosan nazariya',
    icon: 'solar:book-2-bold-duotone',
  },
  {
    value: 'PRACTICAL',
    label: 'Amaliy',
    description: 'Real hayotdan misollar',
    icon: 'solar:hand-shake-bold-duotone',
  },
  {
    value: 'MIX',
    label: 'Aralash',
    description: 'Nazariya + amaliyot',
    icon: 'solar:widget-4-bold-duotone',
  },
];

// Юморные сообщения для прогресс-бара
export const PROGRESS_MESSAGES = [
  {
    step: 0,
    message: 'Qoʻl uskunalarni tayyorlaymiz...',
    emoji: '🔧',
  },
  {
    step: 10,
    message: 'AI mozgimizni uyg\'otmoqdamiz... ☕',
    emoji: '🤖',
  },
  {
    step: 20,
    message: 'Darsliklarni varaqlayapmiz 📚',
    emoji: '📖',
  },
  {
    step: 30,
    message: 'Eng qiziqarli savollarni tanlaymiz 🎯',
    emoji: '🎲',
  },
  {
    step: 40,
    message: 'Oʻquvchilar uchun muammolar yaratmoqdamiz 😈',
    emoji: '😏',
  },
  {
    step: 50,
    message: 'Formulalarni tekshiryapmiz ∑(°Д°)',
    emoji: '🧮',
  },
  {
    step: 60,
    message: 'Javoblarni shifrlaymiz... 🔐',
    emoji: '🔒',
  },
  {
    step: 70,
    message: 'Grammatikani to\'g\'rilaymiz ✍️',
    emoji: '✅',
  },
  {
    step: 80,
    message: 'Oxirgi tekshiruv... hammasi joyidami? 👀',
    emoji: '🔍',
  },
  {
    step: 90,
    message: 'Topshiriqlar tayyor! Oʻquvchilar qaltirasin! 🎉',
    emoji: '🎊',
  },
  {
    step: 100,
    message: 'Tayyor! Oʻquvchilaringizga omad tilaymiz! 🍀',
    emoji: '✨',
  },
];

// Чеклист для прогресс-бара
export const GENERATION_CHECKLIST = [
  {
    id: 'analyze_topic',
    label: 'Mavzu tahlil qilindi',
    icon: 'solar:document-medicine-bold-duotone',
  },
  {
    id: 'generate_tasks',
    label: 'Topshiriqlar yaratildi',
    icon: 'solar:list-check-bold-duotone',
  },
  {
    id: 'validate_answers',
    label: 'Javoblar tekshirildi',
    icon: 'solar:verified-check-bold-duotone',
  },
  {
    id: 'check_formulas',
    label: 'LaTeX formulalar to\'g\'rilandi',
    icon: 'solar:calculator-minimalistic-bold-duotone',
  },
  {
    id: 'check_grammar',
    label: 'Grammatika tekshirildi',
    icon: 'solar:document-add-bold-duotone',
  },
  {
    id: 'finalize',
    label: 'Yakuniy formatlash',
    icon: 'solar:diploma-verified-bold-duotone',
  },
];
