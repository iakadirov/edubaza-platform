import { spawn } from 'child_process';
import { SiteSettings, SiteSettingDB } from '@/types/settings';

/**
 * Get all site settings from database
 */
export async function getAllSettings(): Promise<Partial<SiteSettings>> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT "settingKey", "settingValue" FROM site_settings ORDER BY category, "settingKey";`;

    const proc = spawn('docker', [
      'exec',
      '-i',
      'edubaza_postgres',
      'psql',
      '-U',
      'edubaza',
      '-d',
      'edubaza',
      '-t',
      '-A',
      '-F',
      '|',
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
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

        resolve(settings);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdin.write(sql);
    proc.stdin.end();
  });
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
  category: string
): Promise<Partial<SiteSettings>> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT "settingKey", "settingValue" FROM site_settings WHERE category = '${category}';`;

    const proc = spawn('docker', [
      'exec',
      '-i',
      'edubaza_postgres',
      'psql',
      '-U',
      'edubaza',
      '-d',
      'edubaza',
      '-t',
      '-A',
      '-F',
      '|',
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
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

        resolve(settings);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdin.write(sql);
    proc.stdin.end();
  });
}

/**
 * Get a specific setting value
 */
export async function getSetting<K extends keyof SiteSettings>(
  key: K
): Promise<SiteSettings[K] | null> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT "settingValue" FROM site_settings WHERE "settingKey" = '${key}' LIMIT 1;`;

    const proc = spawn('docker', [
      'exec',
      '-i',
      'edubaza_postgres',
      'psql',
      '-U',
      'edubaza',
      '-d',
      'edubaza',
      '-t',
      '-A',
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
        const value = stdout.trim();
        if (!value) {
          resolve(null);
        } else {
          try {
            resolve(JSON.parse(value));
          } catch (e) {
            console.error(`Failed to parse setting ${key}:`, value);
            resolve(null);
          }
        }
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdin.write(sql);
    proc.stdin.end();
  });
}

/**
 * Update a setting value
 */
export async function updateSetting<K extends keyof SiteSettings>(
  key: K,
  value: SiteSettings[K],
  updatedBy: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const jsonValue = JSON.stringify(value).replace(/'/g, "''");
    const sql = `UPDATE site_settings
                 SET "settingValue" = '${jsonValue}'::jsonb,
                     "updatedAt" = CURRENT_TIMESTAMP,
                     "updatedBy" = '${updatedBy}'
                 WHERE "settingKey" = '${key}';`;

    const proc = spawn('docker', [
      'exec',
      '-i',
      'edubaza_postgres',
      'psql',
      '-U',
      'edubaza',
      '-d',
      'edubaza',
    ]);

    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
        resolve(true);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdin.write(sql);
    proc.stdin.end();
  });
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  settings: Partial<SiteSettings>,
  updatedBy: string
): Promise<boolean> {
  const updates = Object.entries(settings).map(([key, value]) => {
    const jsonValue = JSON.stringify(value).replace(/'/g, "''");
    return `UPDATE site_settings
            SET "settingValue" = '${jsonValue}'::jsonb,
                "updatedAt" = CURRENT_TIMESTAMP,
                "updatedBy" = '${updatedBy}'
            WHERE "settingKey" = '${key}';`;
  });

  return new Promise((resolve, reject) => {
    const sql = `BEGIN; ${updates.join(' ')} COMMIT;`;

    const proc = spawn('docker', [
      'exec',
      '-i',
      'edubaza_postgres',
      'psql',
      '-U',
      'edubaza',
      '-d',
      'edubaza',
    ]);

    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
        resolve(true);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdin.write(sql);
    proc.stdin.end();
  });
}

/**
 * Get full settings info (including metadata)
 */
export async function getSettingsWithMetadata(): Promise<SiteSettingDB[]> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, "settingKey", "settingValue", category, description, "updatedAt", "updatedBy"
                 FROM site_settings
                 ORDER BY category, "settingKey";`;

    const proc = spawn('docker', [
      'exec',
      '-i',
      'edubaza_postgres',
      'psql',
      '-U',
      'edubaza',
      '-d',
      'edubaza',
      '-t',
      '-A',
      '-F',
      '|',
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`SQL execution failed: ${stderr}`));
      } else {
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

        resolve(settings);
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdin.write(sql);
    proc.stdin.end();
  });
}
