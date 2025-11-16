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
        </div>

        {/* Available Subjects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Доступные предметы
          </label>
          <textarea
            value={(settings['content.availableSubjects'] || []).join('\n')}
            onChange={(e) => onChange('content.availableSubjects', e.target.value.split('\n').filter(Boolean))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Matematika&#10;Ona tili&#10;Ingliz tili"
          />
          <p className="text-sm text-gray-500 mt-1">
            По одному предмету на строку
          </p>
        </div>

        {/* Available Grades */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Доступные классы
          </label>
          <input
            type="text"
            value={(settings['content.availableGrades'] || []).join(', ')}
            onChange={(e) => onChange('content.availableGrades', e.target.value.split(',').map(g => parseInt(g.trim())).filter(n => !isNaN(n)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11"
          />
          <p className="text-sm text-gray-500 mt-1">
            Через запятую (например: 1, 2, 3, 4, 5)
          </p>
        </div>
      </div>
    </div>
  );
}
