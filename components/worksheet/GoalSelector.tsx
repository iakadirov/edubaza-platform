'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface Topic {
  id: string;
  titleUz: string;
  gradeNumber: number;
  quarter: number | null;
  weekNumber?: number | null;
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
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const topicInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter topics based on search query
  const filteredTopics = topics.filter((topic) => {
    const query = topicSearchQuery.toLowerCase();
    return (
      topic.titleUz.toLowerCase().includes(query) ||
      (topic.quarter && topic.quarter.toString().includes(query)) ||
      (topic.weekNumber && topic.weekNumber.toString().includes(query))
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        topicInputRef.current &&
        !topicInputRef.current.contains(event.target as Node)
      ) {
        setShowTopicDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle topic input change
  const handleTopicInputChange = (value: string) => {
    setTopicSearchQuery(value);
    setShowTopicDropdown(true);
    setIsCustomTopic(true);

    // If user clears the input, reset selection
    if (!value) {
      onTopicChange(null);
      setIsCustomTopic(false);
    }
  };

  // Handle topic selection from dropdown
  const handleTopicSelect = (topic: Topic) => {
    setTopicSearchQuery(topic.titleUz);
    onTopicChange(topic);
    setShowTopicDropdown(false);
    setIsCustomTopic(false);
  };

  // Handle custom topic (when user doesn't select from list)
  const handleCustomTopicConfirm = () => {
    if (topicSearchQuery.trim()) {
      // Create a custom topic object
      const customTopic: Topic = {
        id: 'custom',
        titleUz: topicSearchQuery.trim(),
        gradeNumber: 0,
        quarter: null,
        keywords: [],
      };
      onTopicChange(customTopic);
      setIsCustomTopic(true);
      setShowTopicDropdown(false);
    }
  };

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
        <div className="relative">
          <label className="block text-sm text-gray-600 mb-2">
            Mavzuni tanlang yoki kiriting:
          </label>

          <div className="relative">
            <input
              ref={topicInputRef}
              type="text"
              value={topicSearchQuery}
              onChange={(e) => handleTopicInputChange(e.target.value)}
              onFocus={() => setShowTopicDropdown(true)}
              placeholder="Mavzu nomi yoki raqamini kiriting..."
              className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
            />
            <Icon
              icon="solar:magnifer-linear"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
            />
          </div>

          {/* Dropdown with filtered topics */}
          {showTopicDropdown && topicSearchQuery && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto"
            >
              {filteredTopics.length > 0 ? (
                <>
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">
                      {filteredTopics.length} ta mavzu topildi
                    </p>
                  </div>
                  {filteredTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleTopicSelect(topic)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {topic.titleUz}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {topic.quarter && (
                              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                <Icon icon="solar:calendar-bold-duotone" className="text-sm" />
                                {topic.quarter}-chorak
                              </span>
                            )}
                            {topic.weekNumber && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                <Icon icon="solar:clock-circle-bold-duotone" className="text-sm" />
                                {topic.weekNumber}-hafta
                              </span>
                            )}
                          </div>
                        </div>
                        <Icon
                          icon="solar:arrow-right-linear"
                          className="text-gray-400 text-lg flex-shrink-0 mt-1"
                        />
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <Icon
                    icon="solar:file-search-bold-duotone"
                    className="text-4xl text-gray-300 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500 mb-3">
                    Hech narsa topilmadi
                  </p>
                  <button
                    type="button"
                    onClick={handleCustomTopicConfirm}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Icon icon="solar:add-circle-bold-duotone" />
                    Yangi mavzu sifatida ishlatish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Custom topic indicator */}
          {selectedTopic && isCustomTopic && selectedTopic.id === 'custom' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <Icon icon="solar:danger-triangle-bold-duotone" className="text-base" />
              <span>Maxsus mavzu (darslikda yo'q)</span>
            </div>
          )}

          {/* Selected topic from list indicator */}
          {selectedTopic && !isCustomTopic && selectedTopic.id !== 'custom' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <Icon icon="solar:check-circle-bold-duotone" className="text-base" />
              <span>Darslik mavzusi tanlandi</span>
              {selectedTopic.quarter && selectedTopic.weekNumber && (
                <span className="ml-auto">
                  {selectedTopic.quarter}-chorak, {selectedTopic.weekNumber}-hafta
                </span>
              )}
            </div>
          )}
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
