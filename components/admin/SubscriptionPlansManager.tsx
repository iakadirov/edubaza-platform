'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

interface SubscriptionPlan {
  id: string;
  planCode: string;
  nameUz: string;
  nameRu: string;
  priceUzs: number;
  features: Record<string, any>;
  limits: {
    worksheetsPerMonth: number;
    taskTypesAccess: number;
    templatesAccess: number;
    maxResourcesAndServices: number;
  };
  displayOrder: number;
  isActive: boolean;
  showWatermark: boolean;
  createdAt: string;
  updatedAt: string;
}

export function SubscriptionPlansManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      setError('Ошибка загрузки тарифов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setEditForm(plan);
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      setSuccess('Тариф успешно обновлен');
      setEditingId(null);
      setEditForm({});
      fetchPlans();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Ошибка обновления тарифа');
      console.error(err);
    }
  };

  const updateEditForm = (field: string, value: any) => {
    if (field.startsWith('limits.')) {
      const limitField = field.split('.')[1];
      setEditForm({
        ...editForm,
        limits: {
          ...editForm.limits!,
          [limitField]: value,
        },
      });
    } else {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление тарифами</h2>
          <p className="text-sm text-gray-600 mt-1">
            Настройка тарифных планов, цен и лимитов
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          const displayPlan = isEditing ? editForm : plan;

          return (
            <div
              key={plan.id}
              className={`bg-white border rounded-lg p-6 shadow-sm ${
                !plan.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayPlan.nameUz || ''}
                        onChange={(e) => updateEditForm('nameUz', e.target.value)}
                        className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900">{plan.nameUz}</h3>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {plan.planCode}
                    </span>
                    {!plan.isActive && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Неактивен
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayPlan.nameRu || ''}
                      onChange={(e) => updateEditForm('nameRu', e.target.value)}
                      placeholder="Название на русском"
                      className="text-sm text-gray-600 border-b border-gray-300 focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{plan.nameRu}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Сохранить"
                      >
                        <Icon icon="solar:check-circle-bold-duotone" className="text-2xl" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Отмена"
                      >
                        <Icon icon="solar:close-circle-bold-duotone" className="text-2xl" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(plan)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                      title="Редактировать"
                    >
                      <Icon icon="solar:pen-line-duotone" className="text-2xl group-hover:hidden" />
                      <Icon icon="solar:pen-bold-duotone" className="text-2xl hidden group-hover:block" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Цена (в месяц)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={displayPlan.priceUzs || 0}
                      onChange={(e) => updateEditForm('priceUzs', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(plan.priceUzs)}
                    </p>
                  )}
                </div>

                {/* Worksheets per month */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Рабочих листов в месяц
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="-1"
                      value={displayPlan.limits?.worksheetsPerMonth || 0}
                      onChange={(e) => updateEditForm('limits.worksheetsPerMonth', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {plan.limits.worksheetsPerMonth === -1 ? '∞ Безлимит' : plan.limits.worksheetsPerMonth}
                    </p>
                  )}
                  {isEditing && <p className="text-xs text-gray-500 mt-1">-1 = безлимит</p>}
                </div>

                {/* Task types access */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Доступ к типам задач
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="-1"
                      value={displayPlan.limits?.taskTypesAccess || 0}
                      onChange={(e) => updateEditForm('limits.taskTypesAccess', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {plan.limits.taskTypesAccess === -1 ? '∞ Все' : plan.limits.taskTypesAccess}
                    </p>
                  )}
                  {isEditing && <p className="text-xs text-gray-500 mt-1">-1 = все</p>}
                </div>

                {/* Templates access */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Доступ к шаблонам
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="-1"
                      value={displayPlan.limits?.templatesAccess || 0}
                      onChange={(e) => updateEditForm('limits.templatesAccess', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {plan.limits.templatesAccess === -1 ? '∞ Все' : plan.limits.templatesAccess}
                    </p>
                  )}
                  {isEditing && <p className="text-xs text-gray-500 mt-1">-1 = все</p>}
                </div>

                {/* Resources and services */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Ресурсы и сервисы
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="-1"
                      value={displayPlan.limits?.maxResourcesAndServices || 0}
                      onChange={(e) => updateEditForm('limits.maxResourcesAndServices', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {plan.limits.maxResourcesAndServices === -1 ? '∞ Безлимит' : plan.limits.maxResourcesAndServices}
                    </p>
                  )}
                  {isEditing && <p className="text-xs text-gray-500 mt-1">-1 = безлимит</p>}
                </div>

                {/* Display order */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Порядок отображения
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      value={displayPlan.displayOrder || 0}
                      onChange={(e) => updateEditForm('displayOrder', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{plan.displayOrder}</p>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={displayPlan.showWatermark !== false}
                      onChange={(e) => updateEditForm('showWatermark', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={plan.showWatermark}
                      disabled
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  )}
                  <label className="ml-2 block text-sm text-gray-700">
                    Показывать водяной знак
                  </label>
                </div>

                <div className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={displayPlan.isActive !== false}
                      onChange={(e) => updateEditForm('isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={plan.isActive}
                      disabled
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  )}
                  <label className="ml-2 block text-sm text-gray-700">
                    Активен
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Примечание:</strong> Водяной знак автоматически отключается для администраторов
          (ADMIN и SUPER_ADMIN) и для пользователей с активными платными подписками.
          Значение -1 в лимитах означает безлимитный доступ.
        </p>
      </div>
    </div>
  );
}
