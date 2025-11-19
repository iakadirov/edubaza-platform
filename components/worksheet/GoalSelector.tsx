'use client';

import { Icon } from '@iconify/react';

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  quarter: number | null;
  keywords: string[];
}

type GoalType = 'TOPIC' | 'CONTROL';
type ContentType = 'SUBJECT' | 'SKILL';

interface GoalSelectorProps {
  contentType: ContentType;
  goalType: GoalType;
  onGoalTypeChange: (type: GoalType) => void;

  // Для темы
  topics: Topic[];
  selectedTopic: Topic | null;
  onTopicChange: (topic: Topic | null) => void;
  onSearchTopic?: (query: string) => void;

  // Для контрольной
  selectedQuarter: number;
  onQuarterChange: (quarter: number) => void;
  selectedWeeks: number[];
  onWeeksChange: (weeks: number[]) => void;
}

export default function GoalSelector({
  contentType,
  goalType,
  onGoalTypeChange,
  topics,
  selectedTopic,
  onTopicChange,
  onSearchTopic,
  selectedQuarter,
  onQuarterChange,
  selectedWeeks,
  onWeeksChange,
}: GoalSelectorProps) {
  const toggleWeek = (week: number) => {
    if (selectedWeeks.includes(week)) {
      onWeeksChange(selectedWeeks.filter((w) => w !== week));
    } else {
      onWeeksChange([...selectedWeeks, week]);
    }
  };

  // Для навыков показываем другие опции
  if (contentType === 'SKILL') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Icon icon="solar:target-bold-duotone" className="text-lg text-purple-600" />
          Maqsad:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onGoalTypeChange('TOPIC')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              goalType === 'TOPIC'
                ? 'border-purple-600 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="solar:graph-up-bold-duotone" className="text-2xl text-purple-600" />
              <span className="font-semibold text-gray-800">Koʻnikmani rivojlantirish</span>
            </div>
            <p className="text-xs text-gray-600">Bosqichma-bosqich mashqlar</p>
          </button>

          <button
            type="button"
            onClick={() => onGoalTypeChange('CONTROL')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              goalType === 'CONTROL'
                ? 'border-purple-600 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon icon="solar:clipboard-check-bold-duotone" className="text-2xl text-purple-600" />
              <span className="font-semibold text-gray-800">Baholar va test</span>
            </div>
            <p className="text-xs text-gray-600">Vaqt chegaralangan nazorat</p>
          </button>
        </div>

        {/* Опции для навыков */}
        {goalType === 'CONTROL' && (
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-2">Vaqt limiti:</label>
            <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none">
              <option value="10">10 daqiqa</option>
              <option value="20">20 daqiqa</option>
              <option value="30">30 daqiqa</option>
              <option value="45">45 daqiqa</option>
              <option value="60">60 daqiqa</option>
            </select>
          </div>
        )}
      </div>
    );
  }

  // Для предметов
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Icon icon="solar:target-bold-duotone" className="text-lg text-blue-600" />
        Maqsad:
      </p>

      {/* Переключатель цели */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onGoalTypeChange('TOPIC')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            goalType === 'TOPIC'
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="solar:book-bookmark-bold-duotone" className="text-2xl text-blue-600" />
            <span className="font-semibold text-gray-800">Mavzuni mustahkamlash</span>
          </div>
          <p className="text-xs text-gray-600">Aniq mavzu boʻyicha topshiriqlar</p>
        </button>

        <button
          type="button"
          onClick={() => onGoalTypeChange('CONTROL')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            goalType === 'CONTROL'
              ? 'border-blue-600 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Icon icon="solar:clipboard-check-bold-duotone" className="text-2xl text-blue-600" />
            <span className="font-semibold text-gray-800">Nazorat ishi</span>
          </div>
          <p className="text-xs text-gray-600">Chorak yoki hafta boʻyicha</p>
        </button>
      </div>

      {/* Если выбрана тема */}
      {goalType === 'TOPIC' && (
        <div>
          <label className="block text-sm text-gray-600 mb-2">Mavzuni tanlang:</label>
          <select
            value={selectedTopic?.id || ''}
            onChange={(e) => {
              const topic = topics.find((t) => t.id === e.target.value);
              onTopicChange(topic || null);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Mavzuni tanlang...</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.titleUz}
                {topic.quarter && ` (${topic.quarter}-chorak)`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Если выбрана контрольная */}
      {goalType === 'CONTROL' && (
        <div className="space-y-4">
          {/* Выбор четверти */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Chorakni tanlang:</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onQuarterChange(q)}
                  className={`py-2 rounded-lg font-semibold transition-all ${
                    selectedQuarter === q
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {q}-chorak
                </button>
              ))}
            </div>
          </div>

          {/* Выбор недель (опционально, множественный выбор) */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Haftalar (ixtiyoriy, bir nechtasini tanlash mumkin):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((week) => (
                <button
                  key={week}
                  type="button"
                  onClick={() => toggleWeek(week)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedWeeks.includes(week)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {week}-hafta
                </button>
              ))}
            </div>
            {selectedWeeks.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Tanlangan: {selectedWeeks.length} hafta
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
