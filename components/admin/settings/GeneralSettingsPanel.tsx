import { SiteSettings } from '@/types/settings';

interface GeneralSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function GeneralSettingsPanel({ settings, onChange }: GeneralSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Общие настройки
        </h2>
        <p className="text-sm text-gray-700 mb-6">
          Основные параметры платформы
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название платформы
          </label>
          <input
            type="text"
            value={settings['site.name'] || ''}
            onChange={(e) => onChange('site.name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="EduBaza.uz"
          />
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <input
            type="text"
            value={settings['site.description'] || ''}
            onChange={(e) => onChange('site.description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ta'lim materiallari platformasi"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email для связи
          </label>
          <input
            type="email"
            value={settings['site.contactEmail'] || ''}
            onChange={(e) => onChange('site.contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="info@edubaza.uz"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон для связи
          </label>
          <input
            type="tel"
            value={settings['site.contactPhone'] || ''}
            onChange={(e) => onChange('site.contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="+998901234567"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Адрес
          </label>
          <input
            type="text"
            value={settings['site.address'] || ''}
            onChange={(e) => onChange('site.address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Toshkent, O'zbekiston"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Часовой пояс
          </label>
          <select
            value={settings['site.timezone'] || 'Asia/Tashkent'}
            onChange={(e) => onChange('site.timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
            <option value="Asia/Samarkand">Asia/Samarkand (UTC+5)</option>
            <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
            <option value="UTC">UTC (UTC+0)</option>
          </select>
        </div>

        {/* Default Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Язык по умолчанию
          </label>
          <select
            value={settings['site.defaultLanguage'] || 'uz'}
            onChange={(e) => onChange('site.defaultLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="uz">Uzbek (O'zbek)</option>
            <option value="ru">Russian (Русский)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
}
