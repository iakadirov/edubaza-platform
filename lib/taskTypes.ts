// Типы заданий для каждого предмета
// Based on AI_PROMPT_ENGINEERING.md

export interface TaskType {
  value: string;
  label: string;
  icon: string;
  description: string;
}

// МАТЕМАТИКА
export const mathematicsTaskTypes: TaskType[] = [
  {
    value: 'PROBLEM_SOLVING',
    label: 'Masala yechish',
    icon: 'solar:calculator-bold-duotone',
    description: 'Matnli va hisoblash masalalari'
  },
  {
    value: 'SHORT_ANSWER',
    label: 'Qisqa javob',
    icon: 'solar:pen-bold-duotone',
    description: 'Raqam yoki qisqa javob kiritish'
  },
  {
    value: 'LONG_ANSWER',
    label: "Batafsil yechim",
    icon: 'solar:document-text-bold-duotone',
    description: 'Qadam-baqadam yechim talabi'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: '4-5 ta variant ichidan tanlash (test - bitta to\'g\'ri javob)'
  },
  {
    value: 'TRUE_FALSE',
    label: "To'g'ri/Noto'g'ri",
    icon: 'solar:check-circle-bold-duotone',
    description: "Ha/Yo'q savollari"
  },
];

// РУССКИЙ ЯЗЫК
export const russianTaskTypes: TaskType[] = [
  {
    value: 'GRAMMAR',
    label: 'Grammatika',
    icon: 'solar:book-bold-duotone',
    description: "Grammatika qoidalarini qo'llash"
  },
  {
    value: 'SPELLING',
    label: 'Imlo',
    icon: 'solar:pen-new-square-bold-duotone',
    description: "To'g'ri yozish"
  },
  {
    value: 'PUNCTUATION',
    label: 'Tinish belgilari',
    icon: 'solar:chat-dots-bold-duotone',
    description: "Tinish belgilarini qo'yish"
  },
  {
    value: 'READING_COMPREHENSION',
    label: 'Matnni tushunish',
    icon: 'solar:document-text-bold-duotone',
    description: "Matn bo'yicha savollar"
  },
  {
    value: 'ESSAY',
    label: 'Insho',
    icon: 'solar:file-text-bold-duotone',
    description: "Mavzu bo'yicha insho yozish"
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variant ichidan tanlash'
  },
];

// УЗБЕКСКИЙ ЯЗЫК
export const uzbekTaskTypes: TaskType[] = [
  {
    value: 'GRAMMAR',
    label: 'Grammatika',
    icon: 'solar:book-bold-duotone',
    description: "Grammatika qoidalarini qo'llash"
  },
  {
    value: 'SPELLING',
    label: 'Imlo',
    icon: 'solar:pen-new-square-bold-duotone',
    description: "To'g'ri yozish"
  },
  {
    value: 'READING_COMPREHENSION',
    label: 'Matnni tushunish',
    icon: 'solar:document-text-bold-duotone',
    description: "Matn bo'yicha savollar"
  },
  {
    value: 'ESSAY',
    label: 'Insho',
    icon: 'solar:file-text-bold-duotone',
    description: "Mavzu bo'yicha insho yozish"
  },
  {
    value: 'VOCABULARY',
    label: "Lug'at boyligi",
    icon: 'solar:book-bookmark-bold-duotone',
    description: "So'z ma'nosi va qo'llanishi"
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variant ichidan tanlash'
  },
];

// АНГЛИЙСКИЙ ЯЗЫК
export const englishTaskTypes: TaskType[] = [
  {
    value: 'GRAMMAR',
    label: 'Grammar',
    icon: 'solar:book-bold-duotone',
    description: 'Grammar rules application'
  },
  {
    value: 'VOCABULARY',
    label: 'Vocabulary',
    icon: 'solar:book-bookmark-bold-duotone',
    description: 'Word meanings and usage'
  },
  {
    value: 'READING_COMPREHENSION',
    label: 'Reading',
    icon: 'solar:document-text-bold-duotone',
    description: 'Text comprehension'
  },
  {
    value: 'LISTENING',
    label: 'Listening',
    icon: 'solar:headphones-bold-duotone',
    description: 'Audio comprehension'
  },
  {
    value: 'SPEAKING',
    label: 'Speaking',
    icon: 'solar:microphone-bold-duotone',
    description: 'Speaking tasks'
  },
  {
    value: 'WRITING',
    label: 'Writing',
    icon: 'solar:pen-bold-duotone',
    description: 'Essay and composition'
  },
];

// ИСТОРИЯ
export const historyTaskTypes: TaskType[] = [
  {
    value: 'SHORT_ANSWER',
    label: 'Qisqa javob',
    icon: 'solar:pen-bold-duotone',
    description: 'Sana, joy, shaxs nomlari'
  },
  {
    value: 'LONG_ANSWER',
    label: 'Batafsil javob',
    icon: 'solar:document-text-bold-duotone',
    description: "Voqeani tahlil qilish"
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
  {
    value: 'TRUE_FALSE',
    label: "To'g'ri/Noto'g'ri",
    icon: 'solar:check-circle-bold-duotone',
    description: 'Tarixiy faktlarni tekshirish'
  },
  {
    value: 'MATCHING',
    label: 'Moslashtirish',
    icon: 'solar:link-circle-bold-duotone',
    description: 'Sana va voqealarni moslashtirish'
  },
  {
    value: 'CHRONOLOGY',
    label: 'Xronologiya',
    icon: 'solar:sort-horizontal-bold-duotone',
    description: 'Voqealarni tartibga solish'
  },
];

// ГЕОГРАФИЯ
export const geographyTaskTypes: TaskType[] = [
  {
    value: 'MAP_WORK',
    label: 'Xarita bilan ishlash',
    icon: 'solar:map-bold-duotone',
    description: 'Xaritada joylarni aniqlash'
  },
  {
    value: 'SHORT_ANSWER',
    label: 'Qisqa javob',
    icon: 'solar:pen-bold-duotone',
    description: 'Geografik nom va tushunchalar'
  },
  {
    value: 'LONG_ANSWER',
    label: 'Batafsil javob',
    icon: 'solar:document-text-bold-duotone',
    description: 'Hodisalarni tushuntirish'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
  {
    value: 'MATCHING',
    label: 'Moslashtirish',
    icon: 'solar:link-circle-bold-duotone',
    description: 'Mamlakat va poytaxtlarni moslashtirish'
  },
];

// ФИЗИКА
export const physicsTaskTypes: TaskType[] = [
  {
    value: 'PROBLEM_SOLVING',
    label: 'Masala yechish',
    icon: 'solar:calculator-bold-duotone',
    description: 'Fizik masalalar'
  },
  {
    value: 'FORMULA_APPLICATION',
    label: "Formula qo'llash",
    icon: 'solar:formula-bold-duotone',
    description: "Formulalarni qo'llash"
  },
  {
    value: 'EXPERIMENT',
    label: 'Tajriba',
    icon: 'solar:test-tube-bold-duotone',
    description: 'Tajriba natijalari tahlili'
  },
  {
    value: 'GRAPH_ANALYSIS',
    label: 'Grafik tahlili',
    icon: 'solar:graph-bold-duotone',
    description: 'Grafik va diagrammalarni tahlil qilish'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
];

// ХИМИЯ
export const chemistryTaskTypes: TaskType[] = [
  {
    value: 'EQUATION',
    label: 'Tenglama',
    icon: 'solar:formula-bold-duotone',
    description: 'Kimyoviy tenglamalar'
  },
  {
    value: 'PROBLEM_SOLVING',
    label: 'Masala yechish',
    icon: 'solar:calculator-bold-duotone',
    description: 'Hisoblash masalalari'
  },
  {
    value: 'EXPERIMENT',
    label: 'Tajriba',
    icon: 'solar:test-tube-bold-duotone',
    description: 'Tajriba tahlili'
  },
  {
    value: 'PROPERTIES',
    label: 'Xossalar',
    icon: 'solar:atom-bold-duotone',
    description: 'Moddalar xossalarini aniqlash'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
];

// БИОЛОГИЯ
export const biologyTaskTypes: TaskType[] = [
  {
    value: 'SHORT_ANSWER',
    label: 'Qisqa javob',
    icon: 'solar:pen-bold-duotone',
    description: 'Tushunchalar va atamalar'
  },
  {
    value: 'LONG_ANSWER',
    label: 'Batafsil javob',
    icon: 'solar:document-text-bold-duotone',
    description: 'Jarayonlarni tushuntirish'
  },
  {
    value: 'DIAGRAM_LABELING',
    label: 'Diagramma belgilash',
    icon: 'solar:diagram-bold-duotone',
    description: 'Rasm qismlarini nomlash'
  },
  {
    value: 'EXPERIMENT',
    label: 'Tajriba',
    icon: 'solar:test-tube-bold-duotone',
    description: 'Tajriba tahlili'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
];

// ИНФОРМАТИКА
export const informaticsTaskTypes: TaskType[] = [
  {
    value: 'CODING',
    label: 'Dasturlash',
    icon: 'solar:code-bold-duotone',
    description: 'Kod yozish va tahlil qilish'
  },
  {
    value: 'ALGORITHM',
    label: 'Algoritm',
    icon: 'solar:diagram-up-bold-duotone',
    description: 'Algoritmlarni tuzish'
  },
  {
    value: 'THEORY',
    label: 'Nazariya',
    icon: 'solar:book-bold-duotone',
    description: 'Nazariy bilimlar'
  },
  {
    value: 'PRACTICAL',
    label: 'Amaliy',
    icon: 'solar:laptop-bold-duotone',
    description: 'Amaliy topshiriqlar'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
];

// ЛИТЕРАТУРА
export const literatureTaskTypes: TaskType[] = [
  {
    value: 'ANALYSIS',
    label: 'Tahlil',
    icon: 'solar:book-bookmark-bold-duotone',
    description: 'Adabiy asar tahlili'
  },
  {
    value: 'READING_COMPREHENSION',
    label: 'Matnni tushunish',
    icon: 'solar:document-text-bold-duotone',
    description: "Matn bo'yicha savollar"
  },
  {
    value: 'ESSAY',
    label: 'Insho',
    icon: 'solar:file-text-bold-duotone',
    description: 'Adabiy insho'
  },
  {
    value: 'QUOTATION',
    label: 'Iqtibos',
    icon: 'solar:chat-quote-bold-duotone',
    description: 'Iqtiboslarni aniqlash'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
];

// DEFAULT (для предметов без специфики)
export const defaultTaskTypes: TaskType[] = [
  {
    value: 'SHORT_ANSWER',
    label: 'Qisqa javob',
    icon: 'solar:pen-bold-duotone',
    description: 'Qisqa javob kiritish'
  },
  {
    value: 'LONG_ANSWER',
    label: 'Batafsil javob',
    icon: 'solar:document-text-bold-duotone',
    description: 'Batafsil javob yozish'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variantlardan tanlash'
  },
  {
    value: 'TRUE_FALSE',
    label: "To'g'ri/Noto'g'ri",
    icon: 'solar:check-circle-bold-duotone',
    description: "To'g'ri yoki noto'g'ri tanlash"
  },
];

// Функция для получения типов заданий по коду предмета
export const getTaskTypesForSubject = (subjectCode: string): TaskType[] => {
  switch (subjectCode) {
    case 'MATHEMATICS':
      return mathematicsTaskTypes;
    case 'RUSSIAN_LANGUAGE':
    case 'RUSSIAN':
      return russianTaskTypes;
    case 'UZBEK_LANGUAGE':
    case 'UZBEK':
      return uzbekTaskTypes;
    case 'ENGLISH_LANGUAGE':
    case 'ENGLISH':
      return englishTaskTypes;
    case 'HISTORY':
      return historyTaskTypes;
    case 'GEOGRAPHY':
      return geographyTaskTypes;
    case 'PHYSICS':
      return physicsTaskTypes;
    case 'CHEMISTRY':
      return chemistryTaskTypes;
    case 'BIOLOGY':
      return biologyTaskTypes;
    case 'INFORMATICS':
    case 'COMPUTER_SCIENCE':
      return informaticsTaskTypes;
    case 'LITERATURE':
      return literatureTaskTypes;
    default:
      return defaultTaskTypes;
  }
};

// Список всех предметов и их типов заданий (для документации)
export const subjectTaskTypesMapping = {
  MATHEMATICS: mathematicsTaskTypes,
  RUSSIAN_LANGUAGE: russianTaskTypes,
  UZBEK_LANGUAGE: uzbekTaskTypes,
  ENGLISH_LANGUAGE: englishTaskTypes,
  HISTORY: historyTaskTypes,
  GEOGRAPHY: geographyTaskTypes,
  PHYSICS: physicsTaskTypes,
  CHEMISTRY: chemistryTaskTypes,
  BIOLOGY: biologyTaskTypes,
  INFORMATICS: informaticsTaskTypes,
  LITERATURE: literatureTaskTypes,
};
