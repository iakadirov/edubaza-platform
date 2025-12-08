'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { SiteSettings, SETTING_CATEGORIES, SiteSettingDB } from '@/types/settings';
import { PageHeader } from '@/components/admin/PageHeader';

// Import setting panels
import { GeneralSettingsPanel } from '@/components/admin/settings/GeneralSettingsPanel';
import { PDFSettingsPanel } from '@/components/admin/settings/PDFSettingsPanel';
import { AISettingsPanel } from '@/components/admin/settings/AISettingsPanel';
import { SMSSettingsPanel } from '@/components/admin/settings/SMSSettingsPanel';
import { SubscriptionSettingsPanel } from '@/components/admin/settings/SubscriptionSettingsPanel';
import { ContentSettingsPanel } from '@/components/admin/settings/ContentSettingsPanel';
import { SecuritySettingsPanel } from '@/components/admin/settings/SecuritySettingsPanel';
import { AnalyticsSettingsPanel } from '@/components/admin/settings/AnalyticsSettingsPanel';
import { MaintenanceSettingsPanel } from '@/components/admin/settings/MaintenanceSettingsPanel';
import { BackupSettingsPanel } from '@/components/admin/settings/BackupSettingsPanel';

type TabKey = keyof typeof SETTING_CATEGORIES;

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Partial<SiteSettings> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<SiteSettings>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        alert('У вас нет доступа к этой странице');
        router.push('/dashboard');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Ошибка при загрузке настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SiteSettings, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: pendingChanges }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setPendingChanges({});
      setHasChanges(false);
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPendingChanges({});
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка настроек...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Не удалось загрузить настройки</div>
      </div>
    );
  }

  // Merge current settings with pending changes
  const currentSettings = { ...settings, ...pendingChanges };

  // Sidebar menu groups
  const menuGroups = [
    {
      title: 'Основные',
      items: [
        { key: 'general', label: 'Общие настройки', icon: 'solar:settings-line-duotone', activeIcon: 'solar:settings-bold-duotone' },
        { key: 'content', label: 'Контент', icon: 'solar:document-text-line-duotone', activeIcon: 'solar:document-text-bold-duotone' },
      ],
    },
    {
      title: 'Интеграции',
      items: [
        { key: 'ai', label: 'AI сервисы', icon: 'solar:atom-line-duotone', activeIcon: 'solar:atom-bold-duotone' },
        { key: 'sms', label: 'SMS (Eskiz)', icon: 'solar:chat-round-line-line-duotone', activeIcon: 'solar:chat-round-line-bold-duotone' },
        { key: 'analytics', label: 'Аналитика', icon: 'solar:chart-line-duotone', activeIcon: 'solar:chart-bold-duotone' },
      ],
    },
    {
      title: 'PDF и документы',
      items: [
        { key: 'pdf', label: 'PDF настройки', icon: 'solar:documents-line-duotone', activeIcon: 'solar:documents-bold-duotone' },
      ],
    },
    {
      title: 'Безопасность',
      items: [
        { key: 'security', label: 'Безопасность', icon: 'solar:lock-keyhole-line-duotone', activeIcon: 'solar:lock-keyhole-bold-duotone' },
        { key: 'backup', label: 'Резервные копии', icon: 'solar:database-line-duotone', activeIcon: 'solar:database-bold-duotone' },
      ],
    },
    {
      title: 'Бизнес',
      items: [
        { key: 'subscription', label: 'Подписки и тарифы', icon: 'solar:card-line-duotone', activeIcon: 'solar:card-bold-duotone' },
      ],
    },
    {
      title: 'Система',
      items: [
        { key: 'maintenance', label: 'Обслуживание', icon: 'solar:settings-minimalistic-line-duotone', activeIcon: 'solar:settings-minimalistic-bold-duotone' },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        icon="solar:settings-bold-duotone"
        title="Настройки системы"
        subtitle="Конфигурация платформы и интеграций"
        backHref="/admin"
      />

      <div>
        {/* Horizontal tabs for settings categories */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-2 -mb-px">
              {menuGroups.map((group) => (
                <div key={group.title} className="flex gap-2">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key as TabKey)}
                      className={`
                        px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                        ${
                          activeTab === item.key
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon
                        icon={activeTab === item.key ? item.activeIcon : item.icon}
                        className="text-lg"
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Save/Cancel buttons */}
        {hasChanges && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-blue-800">
              У вас есть несохраненные изменения
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                disabled={saving}
              >
                Отменить
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {activeTab === 'general' && (
            <GeneralSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'pdf' && (
            <PDFSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'ai' && (
            <AISettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'sms' && (
            <SMSSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'subscription' && (
            <SubscriptionSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'content' && (
            <ContentSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'security' && (
            <SecuritySettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'maintenance' && (
            <MaintenanceSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
          {activeTab === 'backup' && (
            <BackupSettingsPanel
              settings={currentSettings}
              onChange={handleSettingChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
