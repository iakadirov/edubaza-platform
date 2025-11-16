import { SiteSettings } from '@/types/settings';

interface SubscriptionSettingsPanelProps {
  settings: Partial<SiteSettings>;
  onChange: (key: keyof SiteSettings, value: any) => void;
}

export function SubscriptionSettingsPanel({ settings, onChange }: SubscriptionSettingsPanelProps) {
  const plans = settings['subscription.plans'] || {
    free: { name: 'Free', price: 0, limits: { generationsPerMonth: 10, savedWorksheets: 5, aiModels: ['gemini'], prioritySupport: false } },
    basic: { name: 'Basic', price: 50000, limits: { generationsPerMonth: 50, savedWorksheets: 50, aiModels: ['gemini', 'openai'], prioritySupport: false } },
    premium: { name: 'Premium', price: 100000, limits: { generationsPerMonth: 200, savedWorksheets: 200, aiModels: ['gemini', 'openai'], prioritySupport: true } },
    pro: { name: 'Pro', price: 200000, limits: { generationsPerMonth: -1, savedWorksheets: -1, aiModels: ['gemini', 'openai'], prioritySupport: true } },
  };

  const updatePlan = (planKey: string, field: string, value: any) => {
    const updatedPlans = { ...plans };
    if (field.startsWith('limits.')) {
      const limitField = field.split('.')[1];
      updatedPlans[planKey as keyof typeof plans].limits[limitField as keyof typeof plans.free.limits] = value;
    } else {
      updatedPlans[planKey as keyof typeof plans][field as 'name' | 'price'] = value;
    }
    onChange('subscription.plans', updatedPlans);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Подписки и тарифы
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Управление тарифными планами и лимитами
        </p>
      </div>

      {/* Trial Period */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Пробный период (дни)
        </label>
        <input
          type="number"
          min="0"
          value={settings['subscription.trialDays'] ?? 7}
          onChange={(e) => onChange('subscription.trialDays', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Количество дней бесплатного пробного периода для новых пользователей
        </p>
      </div>

      {/* Plans */}
      <div className="space-y-6">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className="border rounded-lg p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 capitalize">
              {key} Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (сум/месяц)
                </label>
                <input
                  type="number"
                  min="0"
                  value={plan.price}
                  onChange={(e) => updatePlan(key, 'price', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Generations per month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Генераций в месяц
                </label>
                <input
                  type="number"
                  min="-1"
                  value={plan.limits.generationsPerMonth}
                  onChange={(e) => updatePlan(key, 'limits.generationsPerMonth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">-1 = безлимитно</p>
              </div>

              {/* Saved worksheets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сохраненных worksheet
                </label>
                <input
                  type="number"
                  min="-1"
                  value={plan.limits.savedWorksheets}
                  onChange={(e) => updatePlan(key, 'limits.savedWorksheets', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">-1 = безлимитно</p>
              </div>

              {/* Priority Support */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={plan.limits.prioritySupport}
                  onChange={(e) => updatePlan(key, 'limits.prioritySupport', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Приоритетная поддержка
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
