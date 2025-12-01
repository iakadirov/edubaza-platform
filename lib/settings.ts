import { executeSql } from './db-helper';
import { SiteSettings, SiteSettingDB } from '@/types/settings';

/**
 * Get all site settings from database
 */
export async function getAllSettings(): Promise<Partial<SiteSettings>> {
  try {
    const sql = `SELECT "settingKey", "settingValue" FROM site_settings ORDER BY category, "settingKey";`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });
    const lines = stdout.trim().split('\n').filter(Boolean);
    const settings: any = {};

    for (const line of lines) {
      const [key, value] = line.split('|');
      if (key && value) {
        try {
          settings[key] = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse setting ${key}:`, value);
        }
      }
    }

    return settings;
  } catch (error) {
    console.error('Error getting all settings:', error);
    throw error;
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
  category: string
): Promise<Partial<SiteSettings>> {
  try {
    const escapedCategory = category.replace(/'/g, "''");
    const sql = `SELECT "settingKey", "settingValue" FROM site_settings WHERE category = '${escapedCategory}';`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });
    const lines = stdout.trim().split('\n').filter(Boolean);
    const settings: any = {};

    for (const line of lines) {
      const [key, value] = line.split('|');
      if (key && value) {
        try {
          settings[key] = JSON.parse(value);
        } catch (e) {
          console.error(`Failed to parse setting ${key}:`, value);
        }
      }
    }

    return settings;
  } catch (error) {
    console.error('Error getting settings by category:', error);
    throw error;
  }
}

/**
 * Get a specific setting value
 */
export async function getSetting<K extends keyof SiteSettings>(
  key: K
): Promise<SiteSettings[K] | null> {
  try {
    const escapedKey = String(key).replace(/'/g, "''");
    const sql = `SELECT "settingValue" FROM site_settings WHERE "settingKey" = '${escapedKey}' LIMIT 1;`;

    const stdout = await executeSql(sql);
    const value = stdout.trim();

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Failed to parse setting ${key}:`, value);
      return null;
    }
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
}

/**
 * Update a setting value
 */
export async function updateSetting<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K],
  updatedBy: string
): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(value).replace(/'/g, "''");
    const escapedKey = String(key).replace(/'/g, "''");
    const escapedUpdatedBy = updatedBy.replace(/'/g, "''");

    const sql = `UPDATE site_settings
                 SET "settingValue" = '${jsonValue}'::jsonb,
                     "updatedAt" = CURRENT_TIMESTAMP,
                     "updatedBy" = '${escapedUpdatedBy}'
                 WHERE "settingKey" = '${escapedKey}';`;

    await executeSql(sql);
    return true;
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  settings: Partial<SiteSettings>,
  updatedBy: string
): Promise<boolean> {
  try {
    const escapedUpdatedBy = updatedBy.replace(/'/g, "''");

    const updates = Object.entries(settings).map(([key, value]) => {
      const jsonValue = JSON.stringify(value).replace(/'/g, "''");
      const escapedKey = key.replace(/'/g, "''");
      return `UPDATE site_settings
              SET "settingValue" = '${jsonValue}'::jsonb,
                  "updatedAt" = CURRENT_TIMESTAMP,
                  "updatedBy" = '${escapedUpdatedBy}'
              WHERE "settingKey" = '${escapedKey}';`;
    });

    const sql = `BEGIN; ${updates.join(' ')} COMMIT;`;
    await executeSql(sql);
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

/**
 * Get full settings info (including metadata)
 */
export async function getSettingsWithMetadata(): Promise<SiteSettingDB[]> {
  try {
    const sql = `SELECT id, "settingKey", "settingValue", category, description, "updatedAt", "updatedBy"
                 FROM site_settings
                 ORDER BY category, "settingKey";`;

    const stdout = await executeSql(sql, { fieldSeparator: '|' });
    const lines = stdout.trim().split('\n').filter(Boolean);
    const settings: SiteSettingDB[] = [];

    for (const line of lines) {
      const [id, settingKey, settingValue, category, description, updatedAt, updatedBy] = line.split('|');
      if (settingKey && settingValue) {
        try {
          settings.push({
            id,
            settingKey: settingKey as keyof SiteSettings,
            settingValue: JSON.parse(settingValue),
            category: category as any,
            description: description || null,
            updatedAt,
            updatedBy: updatedBy || null,
          });
        } catch (e) {
          console.error(`Failed to parse setting ${settingKey}:`, settingValue);
        }
      }
    }

    return settings;
  } catch (error) {
    console.error('Error getting settings with metadata:', error);
    throw error;
  }
}
