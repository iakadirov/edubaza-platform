# Generate Chat Interface - Документация

## Обзор

`/generate-chat` - это улучшенная версия интерфейса для генерации учебных материалов с использованием chat-style UI и интерактивными переменными.

## URL
`http://localhost:3000/generate-chat`

## Основные возможности

### 1. Интерактивный Chat-Style интерфейс

Пользователь видит естественное предложение на узбекском языке:
```
Menga [sinf tanlang] uchun [fan tanlang] fanidan [maqsad tanlang] uchun
[mavzuni kiriting] mavzusida [formatni tanlang] formatda [darajani tanlang]
murakkablikda tuzilgan [sonini tanlang] ta vazifadan iborat printerdan
chiqarishga tayyor material tuzib bering!
```

### 2. Типы переменных (Variables)

#### Grade (Sinf)
- Выбор класса от 1 до 11
- Интерфейс: сетка с 11 кнопками
- Формат: `4-sinf`, `5-sinf` и т.д.

#### Subject (Fan)
- Список предметов из базы данных
- С иконками и цветами
- Пример: Математика, Русский язык, Физика

#### Goal (Maqsad)
4 варианта цели:
1. **MAVZU_MUSTAHKAMLASH** - Закрепление темы
2. **CHSB** - Четвертная суммативная оценка
3. **BSB** - Суммативная оценка по разделу
4. **KONIKMA** - Развитие навыков

#### Topic (Mavzu)
- Autocomplete с поиском по 132 темам математики 4 класса
- Возможность создать кастомную тему
- Индикаторы: "Darslik mavzusi" или "Maxsus mavzu"

#### Quarter & Weeks (Chorak va Haftalar)
Для CHSB и BSB:
- Выбор четверти (1-4)
- Выбор недель (1-9) - мультиселект

#### Format
5 вариантов:
- **DTS** - Государственный стандарт
- **PISA** - Международный стандарт
- **OLIMPIADA** - Олимпиадный уровень
- **KREATIV** - Творческий формат
- **MIKIS** - Смешанный формат

#### Difficulty (Qiyinlik)
4 уровня сложности:
- **OSON** - Легкий (зеленый)
- **ORTA** - Средний (синий)
- **QIYIN** - Сложный (красный)
- **MIKIS** - Смешанный (фиолетовый)

#### Task Count (Topshiriqlar soni)
- Слайдер от 3 до 30 заданий
- Большой дисплей текущего значения

### 3. Визуальный дизайн

#### Неактивная переменная
```css
background: white
border: dashed 1px #DFDFDF
color: #8099FF (светло-синий)
```

#### Активная переменная (выбрано значение)
```css
color: #1761FF (синий)
background: transparent
border: none
```

### 4. Кнопка генерации "TAYYORLASH"

#### Газовый градиент анимация
- Два слоя радиальных градиентов
- Слой 1: Синий-розовый (8 сек)
- Слой 2: Бирюзовый-фиолетовый (10 сек)
- Blur 20px для эффекта "газа"
- Движение, вращение, масштабирование

#### Состояния кнопки
- **Активна**: Анимированный градиент
- **Disabled**: Серый статичный градиент
- **Hover**: Масштабирование + белая рамка (2px, 50% opacity)

### 5. Debug Logs

#### Включение
Кнопка "Debug Logs" в header (правый верхний угол)

#### Содержимое
1. **Сгенерированный промпт**
   - Все выбранные параметры
   - Финальный текст промпта
   - Кнопка "Копировать"

2. **Request Payload (JSON)**
   - Полный JSON объект запроса
   - Все параметры API
   - Кнопка "Копировать"

#### Формат Debug Prompt
```
SINF: 4-sinf
FAN: Matematika (MATHEMATICS)
MAQSAD: MAVZU_MUSTAHKAMLASH
MAVZU: Natural sonlar
FORMAT: DTS
QIYINLIK: ORTA (ORTA)
TOPSHIRIQLAR SONI: 10
TOPSHIRIQ TURLARI: MULTIPLE_CHOICE, SHORT_ANSWER, LONG_ANSWER

=== YARATILGAN PROMTP ===
Menga 4-sinf uchun Matematika fanidan mavzuni mustahkamlash uchun
Natural sonlar mavzusida DTS formatda o'rtacha murakkablikda tuzilgan
10 ta vazifadan iborat printerdan chiqarishga tayyor material tuzib bering!
```

## Технические детали

### State Management
```typescript
// Основные параметры
const [selectedGrade, setSelectedGrade] = useState<number | null>(1);
const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType | null>(null);
const [taskCount, setTaskCount] = useState<number | null>(10);

// Для контрольных работ
const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

// Debug
const [showDebugLogs, setShowDebugLogs] = useState(false);
const [generatedPrompt, setGeneratedPrompt] = useState('');
const [requestPayload, setRequestPayload] = useState<any>(null);
```

### API Request
```typescript
const requestBody = {
  grade: selectedGrade,
  subject: selectedSubject.code,
  topic: selectedTopic?.titleUz || `${selectedGoal} - ${selectedQuarter}-chorak`,
  topicId: selectedTopic?.id || null,
  taskCount,
  aiPercentage: 100,
  difficulty: selectedDifficulties.length > 0 ? selectedDifficulties : [selectedDifficulty],
  taskTypes: selectedTaskTypes.length > 0 ? selectedTaskTypes : ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'LONG_ANSWER'],
  format: selectedFormat,
  language: 'uz-latn',
  tone: 'FRIENDLY',
  context: 'MIX',
  goal: selectedGoal,
  quarter: selectedQuarter,
  weeks: selectedWeeks,
};
```

### Условная логика отображения

```typescript
// Показать поле Topic для MAVZU_MUSTAHKAMLASH и KONIKMA
{(selectedGoal === 'MAVZU_MUSTAHKAMLASH' || selectedGoal === 'KONIKMA' || !selectedGoal) && (
  <button onClick={() => setActiveVariable('topic')}>
    {selectedTopic?.titleUz || 'mavzuni kiriting'}
  </button>
)}

// Показать Quarter для CHSB
{selectedGoal === 'CHSB' && (
  <button onClick={() => setActiveVariable('quarter')}>
    {selectedQuarter}-chorak
  </button>
)}

// Показать Weeks для BSB
{selectedGoal === 'BSB' && (
  <button onClick={() => setActiveVariable('weeks')}>
    {selectedQuarter}-chorak ({selectedWeeks.length} hafta)
  </button>
)}
```

## CSS Animations

### Газовый градиент
```css
@keyframes moveGas1 {
  0% {
    transform: translate(-10%, -10%) rotate(0deg) scale(1);
  }
  50% {
    transform: translate(10%, 5%) rotate(20deg) scale(1.2);
  }
  100% {
    transform: translate(-5%, 10%) rotate(-10deg) scale(1.1);
  }
}

@keyframes moveGas2 {
  0% {
    transform: translate(5%, -15%) rotate(10deg) scale(1.1);
  }
  50% {
    transform: translate(-10%, 10%) rotate(-15deg) scale(0.95);
  }
  100% {
    transform: translate(15%, -5%) rotate(25deg) scale(1.15);
  }
}
```

## Валидация

Перед отправкой формы проверяется:
1. ✅ Выбран класс (grade)
2. ✅ Выбран предмет (subject)
3. ✅ Выбрана цель (goal)
4. ✅ Выбрана тема (topic) - для MAVZU_MUSTAHKAMLASH и KONIKMA
5. ✅ Выбран формат (format)
6. ✅ Выбрана сложность (difficulty)
7. ✅ Указано количество заданий (taskCount)

## Примеры использования

### Создание материала для закрепления темы
1. Выбрать `4-sinf`
2. Выбрать `Matematika`
3. Выбрать `Mavzuni mustahkamlash`
4. Ввести или выбрать `Natural sonlar`
5. Выбрать `DTS`
6. Выбрать `O'rtacha`
7. Выбрать `10 ta`
8. Нажать `TAYYORLASH`

### Создание CHSB
1. Выбрать `4-sinf`
2. Выбрать `Matematika`
3. Выбрать `CHSB`
4. Выбрать `1-chorak`
5. Выбрать `DTS`
6. Выбрать `Aralash`
7. Выбрать `15 ta`
8. Нажать `TAYYORLASH`

## Цветовая палитра

### Основные цвета
- Primary Blue: `#1761FF`
- Light Blue: `#8099FF`
- Border: `#DFDFDF`
- Background: `#F0F5FF`

### Градиент кнопки
- Blue: `rgba(65, 144, 234, 0.9)`
- Pink: `rgba(232, 34, 165, 0.4)`
- Cyan: `rgba(20, 255, 178, 0.8)`
- Purple: `rgba(160, 0, 223, 0.6)`

## Иконки (Iconify Solar)

- Stars: `solar:stars-bold-duotone`
- Code: `solar:code-bold-duotone`
- Copy: `solar:copy-bold-duotone`
- Chat: `solar:chat-round-line-bold-duotone`
- Server: `solar:server-bold-duotone`
- Book: `solar:book-2-bold-duotone`
- Clipboard: `solar:clipboard-check-bold-duotone`
- Document: `solar:document-text-bold-duotone`
- Lightbulb: `solar:lightbulb-bolt-bold-duotone`

## Performance

- Debounce на поиск тем: нет (мгновенный фильтр)
- Виртуализация списков: нет (до 132 элементов)
- Мемоизация: нет (простой state)
- Code splitting: автоматический (Next.js)

## Accessibility

- ARIA labels на кнопках переменных (title атрибут)
- Keyboard navigation для модалов
- Focus management при открытии/закрытии модалов
- Читаемый текст (18px font-size)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Issues

Нет известных проблем на данный момент.

## Future Improvements

1. [ ] История выбранных параметров (localStorage)
2. [ ] Шаблоны часто используемых настроек
3. [ ] Быстрые пресеты для разных типов материалов
4. [ ] Предпросмотр материала перед генерацией
5. [ ] Экспорт настроек в JSON

---

**Дата создания:** 2025-01-21
**Автор:** Edubaza Team
**Версия:** 1.0.0
