import { SiteSettings } from '@/types/settings';

interface SecuritySettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function SecuritySettingsPanel({ settings, onChange }: SecuritySettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Безопасность и приватность
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Настройки безопасности и защиты данных
        </p>
      </div>

      <div className="space-y-6">
        {/* JWT Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Время действия JWT токена (часы)
          </label>
          <input
            type="number"
            min="1"
            max="720"
            value={settings['security.jwtExpirationHours'] ?? 24}
            onChange={(e) => onChange('security.jwtExpirationHours', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Рекомендуется: 24 часа
          </p>
        </div>

        {/* Max Login Attempts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Максимум попыток входа
          </label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings['security.maxLoginAttempts'] ?? 5}
            onChange={(e) => onChange('security.maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Lockout Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Время блокировки после неудачных попыток (минуты)
          </label>
          <input
            type="number"
            min="5"
            max="60"
            value={settings['security.lockoutDurationMinutes'] ?? 15}
            onChange={(e) => onChange('security.lockoutDurationMinutes', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Политика паролей
          </h3>

          <div className="space-y-4">
            {/* Min Password Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Минимальная длина пароля
              </label>
              <input
                type="number"
                min="4"
                max="32"
                value={settings['security.passwordMinLength'] ?? 6}
                onChange={(e) => onChange('security.passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password Requirements */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings['security.passwordRequireUppercase'] ?? false}
                  onChange={(e) => onChange('security.passwordRequireUppercase', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Требовать заглавные буквы
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings['security.passwordRequireNumbers'] ?? false}
                  onChange={(e) => onChange('security.passwordRequireNumbers', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Требовать цифры
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings['security.passwordRequireSpecialChars'] ?? false}
                  onChange={(e) => onChange('security.passwordRequireSpecialChars', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Требовать специальные символы
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
