import { SiteSettings } from '@/types/settings';
import { useState } from 'react';

interface SMSSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function SMSSettingsPanel({ settings, onChange }: SMSSettingsPanelProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          SMS интеграция
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Настройки подключения к Eskiz.uz для отправки SMS
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Eskiz.uz SMS</h3>
            <p className="text-sm text-gray-500 mt-1">
              SMS сервис для отправки уведомлений
            </p>
          </div>
          <button
            onClick={() =>
              onChange('sms.eskiz.enabled', !settings['sms.eskiz.enabled'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['sms.eskiz.enabled'] ? 'bg-green-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['sms.eskiz.enabled'] ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings['sms.eskiz.email'] || ''}
              onChange={(e) => onChange('sms.eskiz.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your-email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings['sms.eskiz.password'] || ''}
                onChange={(e) => onChange('sms.eskiz.password', e.target.value)}
                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>

          {/* Token (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Token (автоматически обновляется)
            </label>
            <input
              type="text"
              value={settings['sms.eskiz.token'] || 'Не получен'}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Токен автоматически обновляется системой при использовании
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                Регистрация на Eskiz.uz
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Для получения доступа к SMS сервису зарегистрируйтесь на{' '}
                  <a
                    href="https://eskiz.uz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline"
                  >
                    eskiz.uz
                  </a>
                  . После регистрации используйте email и пароль от аккаунта.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
