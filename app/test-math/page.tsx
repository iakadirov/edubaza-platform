'use client';

import { MathText } from '@/components/MathText';

export default function TestMathPage() {
  // Примеры правильного форматирования
  const examples = [
    {
      title: 'Inline формула',
      text: 'Найдите предел $\\lim_{x \\to 0} \\frac{\\sin(3x) \\cdot \\cos(2x)}{x \\cdot \\tan(x)}$ и выберите ответ.',
    },
    {
      title: 'Display формула (на отдельной строке)',
      text: 'Faqat bitta to\'g\'ri javobni tanlang\n\n$$\\lim_{x \\to 0} \\frac{\\sin(3x) \\cdot \\cos(2x)}{x \\cdot \\tan(x)}$$',
    },
    {
      title: 'Несколько формул в тексте',
      text: 'Если $a = 5$ и $b = 3$, то $a + b = 8$',
    },
    {
      title: 'Дробь',
      text: 'Формула: $\\frac{a}{b} = c$',
    },
    {
      title: 'Квадратный корень',
      text: 'Решите уравнение: $\\sqrt{x^2 + 1} = 5$',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест математических формул</h1>

        <div className="space-y-6">
          {examples.map((example, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">
                {example.title}
              </h2>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Исходный текст:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {example.text}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Результат:</h3>
                <div className="bg-blue-50 p-4 rounded">
                  <MathText text={example.text} className="text-base" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <h2 className="text-xl font-bold mb-4">Важно!</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Используйте <code className="bg-gray-200 px-2 py-1 rounded">$...$</code> для inline формул (в строке текста)</li>
            <li>Используйте <code className="bg-gray-200 px-2 py-1 rounded">$$...$$</code> для display формул (на отдельной строке)</li>
            <li>Все команды LaTeX должны начинаться с <code className="bg-gray-200 px-2 py-1 rounded">\</code> (например: <code className="bg-gray-200 px-2 py-1 rounded">\lim</code>, <code className="bg-gray-200 px-2 py-1 rounded">\frac</code>)</li>
            <li>В JSON используйте двойной слэш: <code className="bg-gray-200 px-2 py-1 rounded">\\lim</code>, <code className="bg-gray-200 px-2 py-1 rounded">\\frac</code></li>
          </ul>
        </div>

        <div className="mt-8 bg-green-50 border-l-4 border-green-400 p-6 rounded">
          <h2 className="text-xl font-bold mb-4">Пример для вашей задачи:</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">В базе данных (JSON):</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`{
  "questionText": "Faqat bitta to'g'ri javobni tanlang\\n\\n$$\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin(3x) \\\\cdot \\\\cos(2x)}{x \\\\cdot \\\\tan(x)}$$",
  "options": ["1", "2", "3", "6"]
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Или можно так:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`{
  "questionText": "Faqat bitta to'g'ri javobni tanlang. Найдите $\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin(3x) \\\\cdot \\\\cos(2x)}{x \\\\cdot \\\\tan(x)}$",
  "options": ["1", "2", "3", "6"]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
