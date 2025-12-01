# Локальная настройка проекта Edubaza

## Требования

- Docker Desktop (для Windows)
- Node.js 18+
- Git

## Быстрый старт

### 1. Запуск Docker контейнеров

```bash
# Запустить Docker Desktop

# В корне проекта запустить PostgreSQL и Redis
docker-compose up -d

# Проверить что контейнеры запущены
docker ps
```

Должны быть запущены контейнеры:
- `edubaza_postgres` (PostgreSQL база данных)
- `edubaza_redis` (Redis для кеша и очередей)
- `edubaza_redis_commander` (веб-интерфейс для Redis на порту 8081)

### 2. Настройка .env.local

Убедитесь что в `.env.local` есть:

```env
USE_DOCKER_POSTGRES=true
JWT_SECRET=your-secret-key-change-in-production
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=edubaza_redis_password
```

### 3. Установка зависимостей и запуск

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev
```

Проект будет доступен на http://localhost:3000

## Важные отличия локальной и продакшн сред

### Локальная среда
- PostgreSQL в Docker контейнере (`edubaza_postgres`)
- `USE_DOCKER_POSTGRES=true`
- База данных: `edubaza`
- Пользователь: `edubaza`
- Пароль: `edubaza_secure_password_2024_change_this`

### Продакшн (Hetzner)
- PostgreSQL установлен локально на сервере
- `USE_DOCKER_POSTGRES=false` (или не установлен)
- База данных: `edubaza`
- Пользователь: `edubaza`
- Пароль из `DATABASE_PASSWORD`

## Унифицированный код базы данных

Код проекта работает одинаково в обеих средах благодаря универсальной функции `executeSql` в `lib/db-helper.ts`:

```typescript
if (USE_DOCKER) {
  // Локальная разработка - PostgreSQL в Docker
  proc = spawn('docker', ['exec', '-i', 'edubaza_postgres', ...]);
} else {
  // Продакшн - PostgreSQL установлен локально
  proc = spawn('psql', ['-h', 'localhost', ...]);
}
```

## Работа с базой данных

### Подключение к PostgreSQL через Docker

```bash
# Запустить psql в контейнере
docker exec -it edubaza_postgres psql -U edubaza -d edubaza

# Или выполнить SQL напрямую
docker exec -i edubaza_postgres psql -U edubaza -d edubaza -c "SELECT * FROM users LIMIT 5"
```

### Работа с Redis

Redis Commander доступен на http://localhost:8081

## Полезные команды

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить volumes (УДАЛИТ ВСЕ ДАННЫЕ!)
docker-compose down -v

# Посмотреть логи контейнеров
docker-compose logs -f

# Посмотреть логи только PostgreSQL
docker-compose logs -f postgres

# Перезапустить контейнеры
docker-compose restart
```

## Импорт данных с продакшена

Если нужно импортировать данные с продакшена в локальную БД:

```bash
# 1. Создать дамп на проде
ssh root@157.180.73.190 "pg_dump -U edubaza -d edubaza --clean --if-exists" > prod_backup.sql

# 2. Импортировать в локальный Docker
docker exec -i edubaza_postgres psql -U edubaza -d edubaza < prod_backup.sql
```

## Решение проблем

### Docker не запускается
- Убедитесь что Docker Desktop запущен
- Проверьте что не заняты порты 5432 (PostgreSQL) и 6379 (Redis)

### Ошибки SQL
- Убедитесь что `USE_DOCKER_POSTGRES=true` в `.env.local`
- Проверьте что контейнер `edubaza_postgres` запущен: `docker ps`
- Посмотрите логи: `docker-compose logs postgres`

### Next.js не видит изменения в коде
```bash
# Очистить .next кеш и пересобрать
rm -rf .next
npm run build
npm run dev
```
