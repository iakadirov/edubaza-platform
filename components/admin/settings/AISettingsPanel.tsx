import { SiteSettings } from '@/types/settings';
import { useState } from 'react';

interface AISettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function AISettingsPanel({ settings, onChange }: AISettingsPanelProps) {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          AI интеграции
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Настройки подключения к AI сервисам для генерации контента
        </p>
      </div>

      {/* Gemini AI Settings */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Google Gemini AI</h3>
            <p className="text-sm text-gray-500 mt-1">
              Используется по умолчанию для генерации worksheet
            </p>
          </div>
          <button
            onClick={() =>
              onChange('ai.gemini.enabled', !settings['ai.gemini.enabled'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['ai.gemini.enabled'] ? 'bg-green-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['ai.gemini.enabled'] ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="space-y-4">
          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={settings['ai.gemini.apiKey'] || ''}
                onChange={(e) => onChange('ai.gemini.apiKey', e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="AIzaSy..."
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
              >
                {showGeminiKey ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Получите API ключ на{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Gemini Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Модель
              </label>
              <select
                value={settings['ai.gemini.model'] || 'gemini-2.0-flash-exp'}
                onChange={(e) => onChange('ai.gemini.model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Новейшая)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-pro">gemini-pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={settings['ai.gemini.temperature'] ?? 1.0}
                onChange={(e) =>
                  onChange('ai.gemini.temperature', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gemini Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min="1000"
              max="100000"
              step="1000"
              value={settings['ai.gemini.maxTokens'] ?? 8000}
              onChange={(e) =>
                onChange('ai.gemini.maxTokens', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* OpenAI Settings */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">OpenAI</h3>
            <p className="text-sm text-gray-500 mt-1">
              Альтернативный AI провайдер (GPT-4, GPT-3.5)
            </p>
          </div>
          <button
            onClick={() =>
              onChange('ai.openai.enabled', !settings['ai.openai.enabled'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['ai.openai.enabled'] ? 'bg-green-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['ai.openai.enabled'] ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="space-y-4">
          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showOpenAIKey ? 'text' : 'password'}
                value={settings['ai.openai.apiKey'] || ''}
                onChange={(e) => onChange('ai.openai.apiKey', e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
              >
                {showOpenAIKey ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Получите API ключ на{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* OpenAI Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Модель
              </label>
              <select
                value={settings['ai.openai.model'] || 'gpt-4'}
                onChange={(e) => onChange('ai.openai.model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={settings['ai.openai.temperature'] ?? 0.7}
                onChange={(e) =>
                  onChange('ai.openai.temperature', parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* OpenAI Max Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min="1000"
              max="100000"
              step="1000"
              value={settings['ai.openai.maxTokens'] ?? 4000}
              onChange={(e) =>
                onChange('ai.openai.maxTokens', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Рекомендации по настройке
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Gemini</strong> - бесплатная модель с хорошей производительностью, рекомендуется для большинства задач
                </li>
                <li>
                  <strong>Temperature</strong> - контролирует креативность AI (0 = детерминированный, 2 = очень креативный)
                </li>
                <li>
                  <strong>Max Tokens</strong> - максимальная длина сгенерированного контента
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
