'use client';

import { Icon } from '@iconify/react';
import { TASK_SOURCES, DIFFICULTY_LEVELS, TASK_TYPES } from '@/lib/worksheet-generator-config';

interface GenerationParamsProps {
  taskCount: number;
  onTaskCountChange: (count: number) => void;

  taskSource: string;
  onTaskSourceChange: (source: string) => void;

  selectedDifficulties: string[];
  onDifficultiesChange: (difficulties: string[]) => void;

  selectedTaskTypes: string[];
  onTaskTypesChange: (types: string[]) => void;
}

export default function GenerationParams({
  taskCount,
  onTaskCountChange,
  taskSource,
  onTaskSourceChange,
  selectedDifficulties,
  onDifficultiesChange,
  selectedTaskTypes,
  onTaskTypesChange,
}: GenerationParamsProps) {
  const toggleDifficulty = (difficulty: string) => {
    if (selectedDifficulties.includes(difficulty)) {
      const filtered = selectedDifficulties.filter((d) => d !== difficulty);
      onDifficultiesChange(filtered.length === 0 ? ['EASY'] : filtered);
    } else {
      onDifficultiesChange([...selectedDifficulties, difficulty]);
    }
  };

  const toggleTaskType = (type: string) => {
    if (selectedTaskTypes.includes(type)) {
      onTaskTypesChange(selectedTaskTypes.filter((t) => t !== type));
    } else {
      onTaskTypesChange([...selectedTaskTypes, type]);
    }
  };

  const selectAllTaskTypes = () => {
    onTaskTypesChange(TASK_TYPES.map((t) => t.value));
  };

  const basicTaskTypes = TASK_TYPES.filter((t) => t.category === 'basic');
  const advancedTaskTypes = TASK_TYPES.filter((t) => t.category === 'advanced');

  return (
    <div className="space-y-6">
      {/* Количество и Источник в одной строке */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Количество задач */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Icon icon="solar:list-check-bold-duotone" className="text-lg text-blue-600" />
            Topshiriqlar soni:
          </label>
          <select
            value={taskCount}
            onChange={(e) => onTaskCountChange(parseInt(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-medium"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((count) => (
              <option key={count} value={count}>
                {count} ta topshiriq
              </option>
            ))}
          </select>
        </div>

        {/* Источник */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Icon icon="solar:database-bold-duotone" className="text-lg text-purple-600" />
            Manba:
          </label>
          <div className="space-y-2">
            {TASK_SOURCES.map((source) => (
              <label
                key={source.value}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                  taskSource === source.value
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="taskSource"
                  value={source.value}
                  checked={taskSource === source.value}
                  onChange={(e) => onTaskSourceChange(e.target.value)}
                  className="w-4 h-4 text-purple-600"
                />
                <Icon icon={source.icon} className="text-xl text-purple-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{source.label}</div>
                  <div className="text-xs text-gray-500">{source.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Сложность */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Icon icon="solar:chart-2-bold-duotone" className="text-lg text-orange-600" />
          Qiyinlik darajasi (bir nechtasini tanlash mumkin):
        </label>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTY_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => toggleDifficulty(level.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedDifficulties.includes(level.value)
                  ? `border-${level.color}-600 bg-${level.color}-50 shadow-lg`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon
                icon={level.icon}
                className={`text-3xl mb-2 mx-auto ${
                  selectedDifficulties.includes(level.value)
                    ? `text-${level.color}-600`
                    : 'text-gray-400'
                }`}
              />
              <div className="text-center font-semibold text-gray-800">{level.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Типы задач */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Icon icon="solar:widget-4-bold-duotone" className="text-lg text-indigo-600" />
            Topshiriq turlari:
          </label>
          <button
            type="button"
            onClick={selectAllTaskTypes}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Icon icon="solar:check-circle-bold" className="text-lg" />
            Barchasini tanlash
          </button>
        </div>

        {/* Основные типы */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Asosiy turlar
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {basicTaskTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleTaskType(type.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedTaskTypes.includes(type.value)
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <Icon
                  icon={type.icon}
                  className={`text-2xl mb-1 mx-auto ${
                    selectedTaskTypes.includes(type.value) ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-xs font-medium text-gray-800 line-clamp-2">
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Продвинутые типы */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Qoʻshimcha turlar
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {advancedTaskTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleTaskType(type.value)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedTaskTypes.includes(type.value)
                    ? 'border-indigo-600 bg-indigo-50 shadow-md'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <Icon
                  icon={type.icon}
                  className={`text-2xl mb-1 mx-auto ${
                    selectedTaskTypes.includes(type.value) ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-xs font-medium text-gray-800 line-clamp-2">
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Подсказка */}
        {selectedTaskTypes.length === 0 && (
          <p className="text-sm text-red-600 mt-3 flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" className="text-lg" />
            Kamida bitta topshiriq turini tanlang
          </p>
        )}
        {selectedTaskTypes.length > 0 && (
          <p className="text-sm text-green-600 mt-3 flex items-center gap-2">
            <Icon icon="solar:check-circle-bold" className="text-lg" />
            {selectedTaskTypes.length} ta tur tanlandi
          </p>
        )}
      </div>
    </div>
  );
}
