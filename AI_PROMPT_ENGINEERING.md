# Система и логика AI интеграции и промпт инжиниринг для учителей - EduBaza.uz

## Обзор

Этот документ описывает систему условной логики, умных шаблонов и промпт-инжиниринга для генерации учебных материалов с помощью AI.

---

## Философия подхода

### Принципы:

1. **Естественный язык вместо форм** - учитель "разговаривает" с AI, формулируя запрос как предложение
2. **Контекстуальность** - текст адаптируется в зависимости от выбора учителя
3. **Условная логика** - показываем только релевантные параметры
4. **Предметная специфика** - типы заданий зависят от предмета

---

## Типы материалов и их шаблоны

### 1. NAZORAT - Закрепление темы (MAVZU)

**Умный шаблон:**
```
Menga {5-sinf} uchun {Matematika} fanidan
{mavzuni mustahkamlash} uchun {Natural sonlar} mavzusida
{DTS asosida}, {o'rtacha murakkablikda} tuzilgan
{10 ta} vazifadan iborat material tayyorlab bering!
Savollar {yoqimli, sodda va tushunarli} usulda tuzilgan bo'lsin.
```

**Переменные:**
- `{5-sinf}` → класс (обязательно)
- `{Matematika}` → предмет (обязательно)
- `{mavzuni mustahkamlash}` → цель (фиксированный текст для MAVZU)
- `{Natural sonlar}` → тема (обязательно)
- `{DTS asosida}` → источник (условно):
  - "DTS asosida" (по умолчанию)
  - "o'quv dasturi asosida"
  - "erkin"
- `{o'rtacha murakkablikda}` → сложность (условно):
  - "oson" (легко)
  - "o'rtacha murakkablikda" (средне, по умолчанию)
  - "qiyin" (сложно)
  - "aralash murakkablikda" (смешанная)
- `{10 ta}` → количество заданий (5-30)
- `{yoqimli, sodda va tushunarli}` → тон (условно):
  - "yoqimli, sodda va tushunarli" (дружелюбный, по умолчанию)
  - "rasmiy va aniq" (формальный)
  - "ruhlantiradigan va qiziqarli" (мотивирующий)

**Условное отображение:**
- Показываем: тему, источник, сложность, тон
- Скрываем: четверть, недели, AI процент

---

### 2. NAZORAT - Контрольная работа (NAZORAT ISHI)

**Умный шаблон:**
```
Menga {5-sinf} uchun {Matematika} fanidan
{2-chorak} {nazorat ishi} tayyorlab bering!
{1, 2, 3-hafta} materiallarini qamrab oluvchi,
{aralash murakkablikda} {15 ta} topshiriqdan iborat bo'lsin.
Topshiriqlarning {30%} qiyin darajada bo'lsin.
```

**Переменные:**
- `{5-sinf}` → класс (обязательно)
- `{Matematika}` → предмет (обязательно)
- `{2-chorak}` → четверть 1-4 (обязательно)
- `{nazorat ishi}` → цель (фиксированный текст)
- `{1, 2, 3-hafta}` → недели (условно, множественный выбор)
- `{aralash murakkablikda}` → сложность (всегда "aralash" для контрольных)
- `{15 ta}` → количество заданий (10-30)
- `{30%}` → AI процент сложных заданий (0-100%)

**Условное отображение:**
- Показываем: четверть, недели, AI процент
- Скрываем: тему, источник, тон

---

### 3. KONIKMA - Развитие навыков

**Умный шаблон:**
```
Menga {4-sinf} uchun {qo'shish ko'nikmasini} rivojlantirish uchun
{oson va o'rtacha} murakkablikda {20 ta} mashq tayyorlab bering!
Mashqlar {real hayot} misollarida bo'lsin va
{qadam-baqadam tushuntirishlar} bilan taqdim etilsin.
```

**Переменные:**
- `{4-sinf}` → класс (обязательно)
- `{qo'shish ko'nikmasini}` → навык (обязательно, зависит от класса):

  **Класс 1-4:**
  - QO'SHISH (Qo'shish ko'nikmasini) - Сложение
  - AYIRISH (Ayirish ko'nikmasini) - Вычитание
  - KO'PAYTIRISH (Ko'paytirish ko'nikmasini) - Умножение
  - BO'LISH (Bo'lish ko'nikmasini) - Деление
  - MATNLI_MASALALAR (Matnli masalalar yechish ko'nikmasini) - Текстовые задачи

  **Класс 5-11:**
  - ALGEBRA_ASOSLARI (Algebra asoslarini) - Основы алгебры
  - TENGLAMALAR (Tenglamalar yechish ko'nikmasini) - Уравнения
  - GEOMETRIYA (Geometrik masalalar yechish ko'nikmasini) - Геометрия
  - KASRLAR (Kasrlar bilan ishlash ko'nikmasini) - Дроби

- `{oson va o'rtacha}` → сложность (можно выбрать несколько)
- `{20 ta}` → количество упражнений (10-50)
- `{real hayot}` → контекст (условно):
  - "real hayot" (реальная жизнь)
  - "maktab" (школьный контекст)
  - "aralash" (смешанный)
- `{qadam-baqadam tushuntirishlar}` → с объяснением (условно):
  - "qadam-baqadam tushuntirishlar bilan taqdim etilsin" (да)
  - "" (нет, пусто)

**Условное отображение:**
- Показываем: навык, контекст, с объяснением
- Скрываем: тему, предмет, источник, тон

---

### 4. BOSHQOTIRMA - Кроссворд (Phase 2)

**Умный шаблон:**
```
Menga {5-sinf} uchun {Matematika} fanidan
{Geometrik shakllar} mavzusida {15 ta} savoldan iborat
{krossvord} tayyorlab bering! {O'rtacha} murakkablikda bo'lsin.
```

**Переменные:**
- `{5-sinf}` → класс
- `{Matematika}` → предмет
- `{Geometrik shakllar}` → тема
- `{15 ta}` → количество элементов
- `{krossvord}` → тип игры:
  - "krossvord" (кроссворд)
  - "viktorina" (викторина)
  - "bingo"
  - "flashcards" (карточки)
- `{O'rtacha}` → сложность

---

## Типы заданий по предметам

### Математика (MATHEMATICS)

```typescript
const mathematicsTaskTypes = [
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
    description: '4-5 ta variant ichidan tanlash'
  },
  {
    value: 'TRUE_FALSE',
    label: "To'g'ri/Noto'g'ri",
    icon: 'solar:check-circle-bold-duotone',
    description: "Ha/Yo'q savollari"
  },
  {
    value: 'MATCHING',
    label: 'Moslashtirish',
    icon: 'solar:link-circle-bold-duotone',
    description: 'Ifoda va javoblarni moslashtirish'
  },
];
```

---

### Русский язык (RUSSIAN_LANGUAGE)

```typescript
const russianTaskTypes = [
  {
    value: 'GRAMMAR',
    label: 'Grammatika',
    icon: 'solar:book-bold-duotone',
    description: 'Grammatika qoidalarini qo\'llash'
  },
  {
    value: 'SPELLING',
    label: 'Imlo',
    icon: 'solar:pen-new-square-bold-duotone',
    description: 'To\'g\'ri yozish'
  },
  {
    value: 'PUNCTUATION',
    label: 'Tinish belgilari',
    icon: 'solar:chat-dots-bold-duotone',
    description: 'Tinish belgilarini qo\'yish'
  },
  {
    value: 'READING_COMPREHENSION',
    label: 'Matnni tushunish',
    icon: 'solar:document-text-bold-duotone',
    description: 'Matn bo\'yicha savollar'
  },
  {
    value: 'ESSAY',
    label: 'Insho',
    icon: 'solar:file-text-bold-duotone',
    description: 'Mavzu bo\'yicha insho yozish'
  },
  {
    value: 'MULTIPLE_CHOICE',
    label: "Ko'p tanlov",
    icon: 'solar:checklist-bold-duotone',
    description: 'Variant ichidan tanlash'
  },
];
```

---

### Узбекский язык (UZBEK_LANGUAGE)

```typescript
const uzbekTaskTypes = [
  {
    value: 'GRAMMAR',
    label: 'Grammatika',
    icon: 'solar:book-bold-duotone',
    description: 'Grammatika qoidalarini qo\'llash'
  },
  {
    value: 'SPELLING',
    label: 'Imlo',
    icon: 'solar:pen-new-square-bold-duotone',
    description: 'To\'g\'ri yozish'
  },
  {
    value: 'READING_COMPREHENSION',
    label: 'Matnni tushunish',
    icon: 'solar:document-text-bold-duotone',
    description: 'Matn bo\'yicha savollar'
  },
  {
    value: 'ESSAY',
    label: 'Insho',
    icon: 'solar:file-text-bold-duotone',
    description: 'Mavzu bo\'yicha insho yozish'
  },
  {
    value: 'VOCABULARY',
    label: 'Lug\'at boyligi',
    icon: 'solar:book-bookmark-bold-duotone',
    description: 'So\'z ma\'nosi va qo\'llanishi'
  },
];
```

---

### Английский язык (ENGLISH_LANGUAGE)

```typescript
const englishTaskTypes = [
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
```

---

### История (HISTORY)

```typescript
const historyTaskTypes = [
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
    description: 'Voqeani tahlil qilish'
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
```

---

### География (GEOGRAPHY)

```typescript
const geographyTaskTypes = [
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
```

---

### Физика (PHYSICS)

```typescript
const physicsTaskTypes = [
  {
    value: 'PROBLEM_SOLVING',
    label: 'Masala yechish',
    icon: 'solar:calculator-bold-duotone',
    description: 'Fizik masalalar'
  },
  {
    value: 'FORMULA_APPLICATION',
    label: 'Formula qo\'llash',
    icon: 'solar:formula-bold-duotone',
    description: 'Formulalarni qo\'llash'
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
```

---

### Химия (CHEMISTRY)

```typescript
const chemistryTaskTypes = [
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
```

---

### Биология (BIOLOGY)

```typescript
const biologyTaskTypes = [
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
```

---

## Условная логика отображения

### Правила показа переменных в тексте:

```typescript
interface ConditionalLogic {
  materialType: 'NAZORAT' | 'KONIKMA' | 'BOSHQOTIRMA';
  goal?: 'MAVZU' | 'NAZORAT_ISHI';

  // Какие переменные показывать
  showVariables: {
    grade: boolean;          // Всегда true
    subject: boolean;        // true для NAZORAT и BOSHQOTIRMA
    skill: boolean;          // true для KONIKMA
    goal: boolean;           // true для NAZORAT
    topic: boolean;          // true для NAZORAT (MAVZU) и BOSHQOTIRMA
    quarter: boolean;        // true для NAZORAT (NAZORAT_ISHI) и KONIKMA
    weeks: boolean;          // true для NAZORAT (NAZORAT_ISHI) и KONIKMA
    source: boolean;         // true для NAZORAT (MAVZU)
    difficulty: boolean;     // Всегда true
    taskCount: boolean;      // Всегда true
    tone: boolean;           // true для NAZORAT (MAVZU)
    aiPercentage: boolean;   // true для NAZORAT (NAZORAT_ISHI)
    context: boolean;        // true для KONIKMA
    withExplanations: boolean; // true для KONIKMA
  };
}
```

### Пример условной логики:

```typescript
// NAZORAT + MAVZU
{
  materialType: 'NAZORAT',
  goal: 'MAVZU',
  showVariables: {
    grade: true,
    subject: true,
    skill: false,
    goal: true,
    topic: true,
    quarter: false,
    weeks: false,
    source: true,
    difficulty: true,
    taskCount: true,
    tone: true,
    aiPercentage: false,
    context: false,
    withExplanations: false,
  }
}

// NAZORAT + NAZORAT_ISHI
{
  materialType: 'NAZORAT',
  goal: 'NAZORAT_ISHI',
  showVariables: {
    grade: true,
    subject: true,
    skill: false,
    goal: true,
    topic: false,
    quarter: true,
    weeks: true,
    source: false,
    difficulty: true,
    taskCount: true,
    tone: false,
    aiPercentage: true,
    context: false,
    withExplanations: false,
  }
}

// KONIKMA
{
  materialType: 'KONIKMA',
  showVariables: {
    grade: true,
    subject: false,
    skill: true,
    goal: false,
    topic: false,
    quarter: true,
    weeks: true,
    source: false,
    difficulty: true,
    taskCount: true,
    tone: false,
    aiPercentage: false,
    context: true,
    withExplanations: true,
  }
}
```

---

## Промпт-инжиниринг для AI

### Структура финального промпта:

```typescript
interface FinalPrompt {
  // Системный промпт (общий для всех)
  systemPrompt: string;

  // Пользовательский промпт (формируется из шаблона)
  userPrompt: string;

  // Дополнительные инструкции
  additionalInstructions: string;

  // Метаданные для валидации
  metadata: {
    grade: number;
    subject: string;
    materialType: string;
    goal?: string;
    taskCount: number;
    difficulty: string[];
    taskTypes: string[];
  };
}
```

### Системный промпт (общий):

```
Siz O'zbekiston maktablari uchun yuqori sifatli ta'lim materiallari tayyorlaydigan AI yordamchisiz.

Sizning vazifangiz:
1. Davlat ta'lim standartlari (DTS) asosida topshiriqlar yaratish
2. O'quvchilar yosh xususiyatlarini hisobga olish
3. Topshiriqlarni aniq, sodda va tushunarli tilda tuzish
4. Har bir topshiriq uchun to'g'ri javoblar va ball tizimini ko'rsatish

Qoidalar:
- Topshiriqlar o'zbek tilida (lotin yozuvida) bo'lishi kerak
- Hamma topshiriqlar mavzuga mos bo'lishi shart
- Murakkablik darajasi ko'rsatilgan talablarga mos kelishi kerak
- Javoblar aniq va to'liq bo'lishi kerak
```

### Пример формирования финального промпта:

**Для NAZORAT + MAVZU:**
```typescript
const finalPrompt = `
${systemPrompt}

${userPrompt} // Menga 5-sinf uchun Matematika fanidan...

Qo'shimcha talablar:
- Topshiriq turlari: ${taskTypes.join(', ')}
- Murakkablik: ${difficulty.join(', ')}
- Manba: ${source}
- Uslub: ${tone}

Format:
[JSON struktura topshiriqlar uchun]
`;
```

---

## Валидация и фильтрация

### Валидация перед отправкой:

```typescript
const validateRequest = (state: WorkflowState): ValidationResult => {
  const errors: string[] = [];

  // Обязательные поля
  if (!state.grade) errors.push('Sinf tanlanmagan');
  if (!state.materialType) errors.push('Material turi tanlanmagan');

  // Условная валидация
  if (state.materialType === 'NAZORAT') {
    if (!state.subject) errors.push('Fan tanlanmagan');
    if (!state.goal) errors.push('Maqsad tanlanmagan');

    if (state.goal === 'MAVZU' && !state.topic) {
      errors.push('Mavzu tanlanmagan');
    }

    if (state.goal === 'NAZORAT_ISHI' && !state.quarter) {
      errors.push('Chorak tanlanmagan');
    }
  }

  if (state.materialType === 'KONIKMA' && !state.skill) {
    errors.push('Ko\'nikma tanlanmagan');
  }

  if (state.taskTypes.length === 0) {
    errors.push('Kamida bitta topshiriq turini tanlang');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## История изменений

- **2025-01-21** - Создан документ с системой условной логики и промпт-инжиниринга
- **2025-01-21** - Добавлены типы заданий для всех предметов

---

**Документ подготовлен:** Claude Code
**Дата:** 21 января 2025
**Версия:** 1.0
