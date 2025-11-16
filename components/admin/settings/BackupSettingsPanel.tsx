import { SiteSettings } from '@/types/settings';

interface BackupSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function BackupSettingsPanel({ settings, onChange }: BackupSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Резервное копирование
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Настройки автоматического резервного копирования базы данных
        </p>
      </div>

      <div className="space-y-6">
        {/* Auto Backup Enabled */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Автоматическое резервное копирование
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Включить автоматическое создание резервных копий
            </p>
          </div>
          <button
            onClick={() =>
              onChange('backup.autoBackupEnabled', !settings['backup.autoBackupEnabled'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['backup.autoBackupEnabled'] !== false ? 'bg-green-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['backup.autoBackupEnabled'] !== false ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Backup Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Частота резервного копирования
          </label>
          <select
            value={settings['backup.frequency'] || 'daily'}
            onChange={(e) => onChange('backup.frequency', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={settings['backup.autoBackupEnabled'] === false}
          >
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
          </select>
        </div>

        {/* Retention Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Хранить резервные копии (дней)
          </label>
          <input
            type="number"
            min="7"
            max="365"
            value={settings['backup.retentionDays'] ?? 30}
            onChange={(e) => onChange('backup.retentionDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={settings['backup.autoBackupEnabled'] === false}
          />
          <p className="text-sm text-gray-500 mt-1">
            Старые резервные копии будут автоматически удалены
          </p>
        </div>

        {/* Info */}
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
                О резервном копировании
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Резервные копии создаются автоматически в указанное время
                  </li>
                  <li>
                    Backup включает базу данных PostgreSQL
                  </li>
                  <li>
                    Рекомендуется хранить копии не менее 30 дней
                  </li>
                  <li>
                    Для восстановления из резервной копии обратитесь к системному администратору
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Backup Button */}
        <div className="border-t pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Ручное резервное копирование
          </h3>
          <button
            onClick={() => alert('Функция ручного backup будет реализована')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Создать резервную копию сейчас
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Создать резервную копию базы данных немедленно
          </p>
        </div>
      </div>
    </div>
  );
}
