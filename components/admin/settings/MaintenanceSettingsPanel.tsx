import { SiteSettings } from '@/types/settings';

interface MaintenanceSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function MaintenanceSettingsPanel({ settings, onChange }: MaintenanceSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Режим обслуживания
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Временное отключение сайта для технических работ
        </p>
      </div>

      {/* Enable Maintenance Mode */}
      <div className="border rounded-lg p-6 bg-yellow-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Режим обслуживания
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {settings['maintenance.enabled']
                ? '⚠️ Сайт в режиме обслуживания - пользователи не могут войти'
                : 'Сайт работает в обычном режиме'}
            </p>
          </div>
          <button
            onClick={() =>
              onChange('maintenance.enabled', !settings['maintenance.enabled'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['maintenance.enabled'] ? 'bg-yellow-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['maintenance.enabled'] ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* Maintenance Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Сообщение для пользователей
        </label>
        <textarea
          value={settings['maintenance.message'] || ''}
          onChange={(e) => onChange('maintenance.message', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tizim texnik xizmat ko'rsatish rejimida. Tez orada qaytamiz!"
        />
        <p className="text-sm text-gray-500 mt-1">
          Это сообщение будет показано пользователям во время обслуживания
        </p>
      </div>

      {/* Allowed IPs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Разрешенные IP адреса
        </label>
        <textarea
          value={(settings['maintenance.allowedIPs'] || []).join('\n')}
          onChange={(e) =>
            onChange(
              'maintenance.allowedIPs',
              e.target.value.split('\n').filter(Boolean)
            )
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="192.168.1.1&#10;10.0.0.1"
        />
        <p className="text-sm text-gray-500 mt-1">
          IP адреса, которые могут получить доступ к сайту во время обслуживания (по одному на строку)
        </p>
      </div>

      {/* Warning */}
      {settings['maintenance.enabled'] && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Внимание! Режим обслуживания активен
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Сайт недоступен для всех пользователей, кроме указанных IP адресов.
                  Не забудьте отключить режим обслуживания после завершения работ.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
