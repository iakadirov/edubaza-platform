import { SiteSettings } from '@/types/settings';

interface PDFSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function PDFSettingsPanel({ settings, onChange }: PDFSettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          PDF и водяные знаки
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Настройки генерации PDF и водяных знаков
        </p>
      </div>

      <div className="space-y-6">
        {/* Watermark Enabled */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Включить водяной знак
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Отображать логотип EduBaza на сгенерированных PDF
            </p>
          </div>
          <button
            onClick={() =>
              onChange('pdf.watermarkEnabled', !settings['pdf.watermarkEnabled'])
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings['pdf.watermarkEnabled'] ? 'bg-blue-600' : 'bg-gray-300'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings['pdf.watermarkEnabled'] ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Watermark Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Режим водяного знака
          </label>
          <select
            value={settings['pdf.watermarkMode'] || 'diagonal'}
            onChange={(e) => onChange('pdf.watermarkMode', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!settings['pdf.watermarkEnabled']}
          >
            <option value="diagonal">Diagonal (Диагональ)</option>
            <option value="grid">Grid (Сетка)</option>
            <option value="center">Center (По центру)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Выберите расположение водяного знака на странице
          </p>
        </div>

        {/* Watermark Opacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Прозрачность водяного знака: {(settings['pdf.watermarkOpacity'] || 0.1) * 100}%
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={settings['pdf.watermarkOpacity'] || 0.1}
            onChange={(e) => onChange('pdf.watermarkOpacity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            disabled={!settings['pdf.watermarkEnabled']}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Слабо видимый (5%)</span>
            <span>Хорошо видимый (50%)</span>
          </div>
        </div>

        {/* Footer Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Текст футера PDF
          </label>
          <textarea
            value={settings['pdf.footerText'] || ''}
            onChange={(e) => onChange('pdf.footerText', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="© {year} EduBaza.uz - Barcha huquqlar himoyalangan"
          />
          <p className="text-sm text-gray-500 mt-1">
            Используйте &#123;year&#125; для автоматической подстановки текущего года
          </p>
        </div>

        {/* Preview */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Предпросмотр</h3>
          <div className="bg-gray-100 p-6 rounded-lg relative overflow-hidden h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              {settings['pdf.watermarkEnabled'] ? (
                <div
                  className="text-blue-500 font-bold text-4xl select-none"
                  style={{
                    opacity: settings['pdf.watermarkOpacity'] || 0.1,
                    transform: settings['pdf.watermarkMode'] === 'diagonal' ? 'rotate(-45deg)' : 'none',
                  }}
                >
                  EduBaza.uz
                </div>
              ) : (
                <div className="text-gray-400">Водяной знак отключен</div>
              )}
            </div>
            <div className="relative z-10 bg-white p-4 rounded shadow-sm">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
