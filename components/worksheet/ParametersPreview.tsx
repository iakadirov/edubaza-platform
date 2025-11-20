'use client';

import { Icon } from '@iconify/react';
import { SKILLS, FORMATS, DIFFICULTY_LEVELS, TASK_TYPES } from '@/lib/worksheet-generator-config';

interface Subject {
  nameUz: string;
  icon: string;
}

interface Topic {
  titleUz: string;
}

interface ParametersPreviewProps {
  // Базовые
  grade: number;
  contentType: 'SUBJECT' | 'SKILL';
  subject: Subject | null;
  skill: string | null;
  format: string | null;
  goalType: 'TOPIC' | 'CONTROL';
  topic: Topic | null;
  quarter: number;
  weeks: number[];

  // Параметры
  taskCount: number;
  aiPercentage: number;
  difficulties: string[];
  taskTypes: string[];
}

export default function ParametersPreview(props: ParametersPreviewProps) {
  const selectedSkill = SKILLS.find((s) => s.id === props.skill);
  const selectedFormat = FORMATS.find((f) => f.id === props.format);
  const selectedDifficulties = DIFFICULTY_LEVELS.filter((d) =>
    props.difficulties.includes(d.value)
  );
  const selectedTaskTypes = TASK_TYPES.filter((t) => props.taskTypes.includes(t.value));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="solar:eye-bold-duotone" className="text-2xl text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Tanlangan parametrlar</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Sinf */}
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
          <Icon icon="solar:user-bold-duotone" className="text-lg text-blue-600" />
          <span className="text-sm text-gray-600">Sinf:</span>
          <span className="font-semibold text-gray-800">{props.grade}-sinf</span>
        </div>

        {/* Предмет или Навык */}
        {props.contentType === 'SUBJECT' && props.subject && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <span className="text-lg">{props.subject.icon}</span>
            <span className="text-sm text-gray-600">Fan:</span>
            <span className="font-semibold text-gray-800">{props.subject.nameUz}</span>
          </div>
        )}

        {props.contentType === 'SKILL' && selectedSkill && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Icon icon={selectedSkill.icon} className="text-lg text-purple-600" />
            <span className="text-sm text-gray-600">Koʻnikma:</span>
            <span className="font-semibold text-gray-800">{selectedSkill.nameUz}</span>
          </div>
        )}

        {/* Формат */}
        {selectedFormat && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Icon icon={selectedFormat.icon} className="text-lg text-green-600" />
            <span className="text-sm text-gray-600">Format:</span>
            <span className="font-semibold text-gray-800">{selectedFormat.nameUz}</span>
          </div>
        )}

        {/* Тема или Четверть */}
        {props.goalType === 'TOPIC' && props.topic && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Icon icon="solar:book-bookmark-bold-duotone" className="text-lg text-blue-600" />
            <span className="text-sm text-gray-600">Mavzu:</span>
            <span className="font-semibold text-gray-800 line-clamp-1">{props.topic.titleUz}</span>
          </div>
        )}

        {props.goalType === 'CONTROL' && (
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
            <Icon icon="solar:calendar-bold-duotone" className="text-lg text-blue-600" />
            <span className="text-sm text-gray-600">Chorak:</span>
            <span className="font-semibold text-gray-800">
              {props.quarter}-chorak
              {props.weeks.length > 0 && ` (${props.weeks.length} hafta)`}
            </span>
          </div>
        )}

        {/* Количество */}
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
          <Icon icon="solar:list-check-bold-duotone" className="text-lg text-purple-600" />
          <span className="text-sm text-gray-600">Soni:</span>
          <span className="font-semibold text-gray-800">{props.taskCount} ta</span>
        </div>

        {/* Источник */}
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg">
          <Icon icon="solar:database-bold-duotone" className="text-lg text-purple-600" />
          <span className="text-sm text-gray-600">Manba:</span>
          <span className="font-semibold text-gray-800">
            {props.aiPercentage === 0
              ? '100% Darsliklar'
              : props.aiPercentage === 100
              ? '100% AI'
              : `${100 - props.aiPercentage}% Darslik + ${props.aiPercentage}% AI`}
          </span>
        </div>
      </div>

      {/* Сложность */}
      {selectedDifficulties.length > 0 && (
        <div className="mt-4 bg-white p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Qiyinlik:</div>
          <div className="flex flex-wrap gap-2">
            {selectedDifficulties.map((d) => (
              <span
                key={d.value}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <Icon icon={d.icon} />
                {d.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Типы задач */}
      {selectedTaskTypes.length > 0 && (
        <div className="mt-4 bg-white p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            Topshiriq turlari ({selectedTaskTypes.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTaskTypes.map((t) => (
              <span
                key={t.value}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1"
              >
                <Icon icon={t.icon} />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
