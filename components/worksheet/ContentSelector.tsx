'use client';

import { Icon } from '@iconify/react';
import { SKILLS, FORMATS } from '@/lib/worksheet-generator-config';

interface Subject {
  id: string;
  code: string;
  nameUz: string;
  descriptionUz?: string;
  icon: string;
  color: string;
}

type ContentType = 'SUBJECT' | 'SKILL';

interface ContentSelectorProps {
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;

  // Для предметов
  subjects: Subject[];
  selectedSubject: Subject | null;
  onSubjectChange: (subject: Subject) => void;

  // Для навыков
  selectedSkill: string | null;
  onSkillChange: (skillId: string) => void;

  // Для формата (опционально при выборе предмета)
  selectedFormat: string | null;
  onFormatChange: (formatId: string | null) => void;
}

export default function ContentSelector({
  contentType,
  onContentTypeChange,
  subjects,
  selectedSubject,
  onSubjectChange,
  selectedSkill,
  onSkillChange,
  selectedFormat,
  onFormatChange,
}: ContentSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Переключатель: Предмет или Навык */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onContentTypeChange('SUBJECT')}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
            contentType === 'SUBJECT'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon icon="solar:book-bold-duotone" className="text-2xl" />
          <span>Fan</span>
        </button>
        <button
          type="button"
          onClick={() => onContentTypeChange('SKILL')}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
            contentType === 'SKILL'
              ? 'bg-purple-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Icon icon="solar:lightbulb-bold-duotone" className="text-2xl" />
          <span>Koʻnikma</span>
        </button>
      </div>

      {/* Если выбран Предмет */}
      {contentType === 'SUBJECT' && (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="solar:book-bold-duotone" className="text-lg text-blue-600" />
              Fanni tanlang:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => onSubjectChange(subject)}
                  className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                    selectedSubject?.id === subject.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{subject.icon}</span>
                    <span className="font-semibold text-gray-800 text-sm">{subject.nameUz}</span>
                  </div>
                  {subject.descriptionUz && (
                    <p className="text-xs text-gray-500 line-clamp-1">{subject.descriptionUz}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Опциональный формат */}
          {selectedSubject && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Icon icon="solar:widget-5-bold-duotone" className="text-lg text-green-600" />
                Format qoʻshish (ixtiyoriy):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FORMATS.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => onFormatChange(selectedFormat === format.id ? null : format.id)}
                    className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedFormat === format.id
                        ? 'border-green-600 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <Icon
                      icon={format.icon}
                      className={`text-2xl mb-1 mx-auto ${
                        selectedFormat === format.id ? 'text-green-600' : 'text-gray-600'
                      }`}
                    />
                    <p className="text-xs font-medium text-center text-gray-800">
                      {format.nameUz}
                    </p>
                    <p className="text-[10px] text-gray-500 text-center line-clamp-1 mt-1">
                      {format.descriptionUz}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Если выбран Навык */}
      {contentType === 'SKILL' && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Icon icon="solar:lightbulb-bold-duotone" className="text-lg text-purple-600" />
            Koʻnikmani tanlang:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SKILLS.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => onSkillChange(skill.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                  selectedSkill === skill.id
                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    icon={skill.icon}
                    className={`text-3xl ${
                      selectedSkill === skill.id ? 'text-purple-600' : 'text-gray-600'
                    }`}
                  />
                  <span className="font-semibold text-gray-800">{skill.nameUz}</span>
                </div>
                <p className="text-sm text-gray-600">{skill.descriptionUz}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
