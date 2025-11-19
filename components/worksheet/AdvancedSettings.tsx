'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { LANGUAGES, TONES, CONTEXTS } from '@/lib/worksheet-generator-config';

interface AdvancedSettingsProps {
  language: string;
  onLanguageChange: (lang: string) => void;

  tone: string;
  onToneChange: (tone: string) => void;

  context: string;
  onContextChange: (context: string) => void;

  customInstructions: string;
  onCustomInstructionsChange: (instructions: string) => void;
}

export default function AdvancedSettings({
  language,
  onLanguageChange,
  tone,
  onToneChange,
  context,
  onContextChange,
  customInstructions,
  onCustomInstructionsChange,
}: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Header - всегда видим */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon
            icon="solar:settings-bold-duotone"
            className="text-2xl text-gray-600"
          />
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">Qoʻshimcha sozlamalar</h3>
            <p className="text-xs text-gray-500">Til, uslub va boshqa parametrlar</p>
          </div>
        </div>
        <Icon
          icon={isExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
          className="text-xl text-gray-600"
        />
      </button>

      {/* Контент - показывается при раскрытии */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t-2 border-gray-200 pt-6 bg-white">
          {/* Язык */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="solar:flag-bold-duotone" className="text-lg text-blue-600" />
              Til:
            </label>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <label
                  key={lang.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    !lang.enabled
                      ? 'opacity-50 cursor-not-allowed bg-gray-50'
                      : language === lang.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.value}
                    checked={language === lang.value}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    disabled={!lang.enabled}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Icon icon={lang.icon} className="text-xl text-blue-600" />
                  <span className="font-medium text-gray-800">{lang.label}</span>
                  {!lang.enabled && (
                    <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      Tez orada
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Стиль/Тон */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="solar:chat-round-bold-duotone" className="text-lg text-purple-600" />
              Uslub:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onToneChange(t.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    tone === t.value
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Icon
                    icon={t.icon}
                    className={`text-2xl mb-1 mx-auto ${
                      tone === t.value ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium text-gray-800">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Контекст */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="solar:widget-4-bold-duotone" className="text-lg text-green-600" />
              Kontekst:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CONTEXTS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onContextChange(c.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    context === c.value
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <Icon
                    icon={c.icon}
                    className={`text-2xl mb-1 mx-auto ${
                      context === c.value ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="text-sm font-medium text-gray-800">{c.label}</div>
                  <div className="text-xs text-gray-500">{c.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Пользовательские инструкции */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Icon icon="solar:text-field-bold-duotone" className="text-lg text-orange-600" />
              Maxsus koʻrsatmalar AI uchun (ixtiyoriy):
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => onCustomInstructionsChange(e.target.value)}
              placeholder="Misol: Kundalik hayotdan misollar qoʻshing, rasmlar bilan savol yarating..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              AIga qoʻshimcha yo'riqnomalar yozishingiz mumkin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
