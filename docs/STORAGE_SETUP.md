# 📦 Настройка хранилища файлов для Edubaza

## 🎯 Обзор

Платформа поддерживает два типа хранилища:
- **Local** (локальное) - для разработки
- **Cloud** (Yandex Cloud Object Storage) - для production

Переключение между ними происходит через переменную окружения `STORAGE_TYPE`.

---

## 🛠️ Development Setup (Локальное хранилище)

### 1. Настройка .env.local

```bash
# Используем локальное хранилище
STORAGE_TYPE=local
```

### 2. Создание папки для uploads

```bash
mkdir -p public/uploads
```

### 3. Готово!

Файлы будут сохраняться в `public/uploads/` и доступны по URL `/uploads/...`

---

## ☁️ Production Setup (Yandex Cloud)

### Шаг 1: Создание аккаунта Yandex Cloud

1. Перейдите на https://cloud.yandex.ru/
2. Зарегистрируйтесь или войдите
3. Создайте новый проект (billing account)

### Шаг 2: Создание Object Storage bucket

1. В консоли Yandex Cloud откройте **Object Storage**
2. Нажмите **"Создать бакет"**
3. Укажите параметры:
   - **Имя**: `edubaza-files` (или своё уникальное)
   - **Класс хранилища**: Standard
   - **Доступ**: Ограниченный (private)
   - **Регион**: ru-central1

### Шаг 3: Получение Access Keys

1. Перейдите в **Service Accounts** (Сервисные аккаунты)
2. Создайте новый сервисный аккаунт:
   - **Имя**: `edubaza-storage`
   - **Роль**: `storage.admin`
3. Создайте **Static Access Key**:
   - Сохраните **Access Key ID**
   - Сохраните **Secret Access Key** (больше не покажется!)

### Шаг 4: Настройка переменных окружения

Добавьте в `.env.local` (для production):

```bash
# Используем облачное хранилище
STORAGE_TYPE=cloud

# Yandex Cloud credentials
YC_ACCESS_KEY_ID=YCAJEXXXXXXXXXXX
YC_SECRET_ACCESS_KEY=YCMxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
YC_BUCKET_NAME=edubaza-files
```

### Шаг 5: Настройка CORS (опционально)

Если нужна загрузка с фронтенда напрямую:

1. В bucket настройках откройте **CORS**
2. Добавьте правило:

```json
[
  {
    "id": "allow-edubaza",
    "max_age_seconds": 3600,
    "allowed_methods": ["GET", "PUT", "POST", "DELETE"],
    "allowed_origins": ["https://edubaza.uz", "https://www.edubaza.uz"],
    "allowed_headers": ["*"],
    "expose_headers": ["ETag"]
  }
]
```

---

## 💻 Использование в коде

### Загрузка файла (Frontend)

```typescript
// components/FileUploader.tsx
async function handleUpload(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'worksheets'); // папка назначения

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const { data } = await response.json();
  console.log('Файл загружен:', data.url);
  // data.url - публичный URL файла
}
```

### Загрузка файла (Backend API)

```typescript
import { uploadFile, generateFileKey } from '@/lib/storage';

// В вашем API route
const buffer = await file.arrayBuffer();
const fileKey = generateFileKey(file.name, 'worksheets');
const url = await uploadFile(Buffer.from(buffer), fileKey, file.type);

// url - готовый публичный URL
// В local: /uploads/worksheets/...
// В cloud: https://storage.yandexcloud.net/edubaza-files/worksheets/...
```

### Удаление файла

```typescript
import { deleteFile } from '@/lib/storage';

await deleteFile('worksheets/1234_abc_file.pdf');
```

### Получение временной ссылки (для приватных файлов)

```typescript
import { getSignedFileUrl } from '@/lib/storage';

// URL действителен 1 час
const signedUrl = await getSignedFileUrl('private/document.pdf', 3600);
```

---

## 📊 Стоимость (Yandex Cloud)

Примерная стоимость для 10,000 пользователей:

| Ресурс | Объём | Цена/месяц |
|--------|-------|------------|
| Хранение | 100 GB | ~70₽ |
| Трафик (исходящий) | 500 GB | ~750₽ |
| **Итого** | | **~820₽/месяц** |

---

## 🔄 Миграция с local на cloud

### 1. Подготовка

```bash
# Убедитесь что у вас есть доступ к Yandex Cloud
echo $YC_ACCESS_KEY_ID
```

### 2. Скрипт миграции (create if needed)

```typescript
// scripts/migrate-to-cloud.ts
import fs from 'fs/promises';
import path from 'path';
import { uploadFile } from '../lib/storage';

async function migrateFiles() {
  const localDir = path.join(process.cwd(), 'public/uploads');
  const files = await fs.readdir(localDir, { recursive: true });

  for (const file of files) {
    const filePath = path.join(localDir, file);
    const buffer = await fs.readFile(filePath);
    const mimeType = 'application/octet-stream'; // определите по расширению

    await uploadFile(buffer, file, mimeType);
    console.log(`Migrated: ${file}`);
  }
}

migrateFiles();
```

### 3. Смена переменной

```bash
# В .env.local
STORAGE_TYPE=cloud  # было: local
```

---

## 🧪 Тестирование

### Проверка локального хранилища

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf" \
  -F "type=test"
```

### Проверка облачного хранилища

1. Загрузите файл через API
2. Откройте URL в браузере
3. Проверьте в Yandex Cloud консоли наличие файла

---

## 🔧 Troubleshooting

### Ошибка: "AccessDenied"

**Причина**: Неверные credentials или нет прав у сервисного аккаунта

**Решение**:
1. Проверьте `YC_ACCESS_KEY_ID` и `YC_SECRET_ACCESS_KEY`
2. Убедитесь что сервисный аккаунт имеет роль `storage.admin`

### Ошибка: "NoSuchBucket"

**Причина**: Bucket не существует или неверное имя

**Решение**:
1. Проверьте `YC_BUCKET_NAME` в .env
2. Убедитесь что bucket создан в той же region

### Файлы не отображаются

**Причина**: CORS не настроен или неверный

**Решение**:
1. Настройте CORS в bucket (см. выше)
2. Проверьте что домен указан правильно

---

## 📝 Best Practices

1. **Всегда используйте `STORAGE_TYPE=local` в development**
2. **Никогда не коммитьте `.env.local` в Git**
3. **Храните credentials в секретах (GitHub Secrets, Vercel Env Vars)**
4. **Используйте CDN для раздачи файлов в production**
5. **Настройте lifecycle rules для автоматического удаления старых файлов**

---

## 🚀 Production Checklist

- [ ] Создан Yandex Cloud account
- [ ] Создан Object Storage bucket
- [ ] Получены Access Keys
- [ ] Настроены переменные окружения
- [ ] CORS настроен (если нужен)
- [ ] Протестирована загрузка файлов
- [ ] Настроен CDN (опционально)
- [ ] Настроен backup bucket (опционально)

---

## 🆘 Support

Если возникли проблемы:
1. Проверьте логи: `docker logs edubaza_app`
2. Проверьте Yandex Cloud console: https://console.cloud.yandex.ru/
3. Документация Yandex Object Storage: https://cloud.yandex.ru/docs/storage/
