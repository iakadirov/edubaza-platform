import { SiteSettings } from '@/types/settings';

interface AnalyticsSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function AnalyticsSettingsPanel({ settings, onChange }: AnalyticsSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Аналитика и мониторинг
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Интеграция с сервисами аналитики и отслеживания ошибок
        </p>
      </div>

      <div className="space-y-6">
        {/* Google Analytics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={settings['analytics.googleAnalyticsId'] || ''}
            onChange={(e) => onChange('analytics.googleAnalyticsId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="G-XXXXXXXXXX или UA-XXXXXXXXX-X"
          />
          <p className="text-sm text-gray-500 mt-1">
            Tracking ID из Google Analytics
          </p>
        </div>

        {/* Yandex Metrica */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yandex Metrica ID
          </label>
          <input
            type="text"
            value={settings['analytics.yandexMetricaId'] || ''}
            onChange={(e) => onChange('analytics.yandexMetricaId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="12345678"
          />
          <p className="text-sm text-gray-500 mt-1">
            Номер счетчика из Yandex Metrica
          </p>
        </div>

        {/* Sentry DSN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sentry DSN
          </label>
          <input
            type="text"
            value={settings['analytics.sentryDsn'] || ''}
            onChange={(e) => onChange('analytics.sentryDsn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="https://xxx@xxx.ingest.sentry.io/xxx"
          />
          <p className="text-sm text-gray-500 mt-1">
            DSN для отслеживания ошибок в реальном времени
          </p>
        </div>

        {/* Enable Error Logging */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Включить логирование ошибок
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Записывать ошибки в консоль и системные логи
            </p>
          </div>
          <button
            onClick={() =>
              onChange('analytics.enableErrorLogging', !settings['analytics.enableErrorLogging'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['analytics.enableErrorLogging'] !== false ? 'bg-blue-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['analytics.enableErrorLogging'] !== false ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
