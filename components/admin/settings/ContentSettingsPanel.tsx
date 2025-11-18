import { SiteSettings } from '@/types/settings';

interface ContentSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function ContentSettingsPanel({ settings, onChange }: ContentSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Настройки контента
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Ограничения и параметры для пользовательского контента
        </p>
      </div>

      <div className="space-y-6">
        {/* Max Image Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Максимальный размер изображения (MB)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings['content.maxImageSizeMB'] ?? 5}
            onChange={(e) => onChange('content.maxImageSizeMB', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Ограничивает размер загружаемых изображений к задачам
          </p>
        </div>

        {/* Max Tasks Per Worksheet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Максимум задач в worksheet
          </label>
          <input
            type="number"
            min="5"
            max="100"
            value={settings['content.maxTasksPerWorksheet'] ?? 20}
            onChange={(e) => onChange('content.maxTasksPerWorksheet', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Максимальное количество задач в одном worksheet
          </p>
        </div>

        {/* Allow Users to Delete Worksheets */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings['content.allowUsersToDeleteWorksheets'] ?? true}
              onChange={(e) => onChange('content.allowUsersToDeleteWorksheets', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">
                Разрешить пользователям удалять свои worksheet'ы
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Если отключено, пользователи не смогут удалять созданные worksheet'ы
              </p>
            </div>
          </label>
        </div>

        {/* Info about subjects and grades */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ Предметы и классы
          </h3>
          <p className="text-sm text-blue-800 mb-2">
            Доступные предметы и классы теперь управляются через раздел <strong>Структура</strong>.
          </p>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Предметы: управляются в таблице <code className="bg-blue-100 px-1 rounded">subjects</code> через поле <code className="bg-blue-100 px-1 rounded">is_visible</code></li>
            <li>Классы: управляются в таблице <code className="bg-blue-100 px-1 rounded">topics</code> через поле <code className="bg-blue-100 px-1 rounded">is_visible</code></li>
            <li>Это позволяет избежать дублирования данных и упрощает управление</li>
          </ul>
          <div className="mt-3">
            <a
              href="/admin/structure"
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти в Структуру →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
