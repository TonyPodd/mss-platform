# Деплой на Timeweb Cloud App Platform

## Шаг 1: Создание проектов в App Platform

Зайдите в [Timeweb Cloud](https://timeweb.cloud) → App Platform → Создать приложение

### 1.1 Создайте PostgreSQL базу данных

1. App Platform → Базы данных → Создать базу данных
2. Выберите PostgreSQL 15
3. Название: `mss-production`
4. Тариф: Минимальный (можно увеличить позже)
5. После создания скопируйте **Connection String** - он понадобится

Пример строки подключения:
```
postgresql://username:password@db-host:5432/mss-production
```

### 1.2 Создайте API сервис

1. App Platform → Создать приложение
2. Выберите **GitHub** репозиторий
3. Выберите ваш репозиторий `mss`
4. Название: `mss-api`
5. **Root Directory**: `services/api`
6. **Build Command**:
   ```bash
   cd ../.. && pnpm install && cd services/api && pnpm exec npx prisma generate && pnpm build
   ```
7. **Start Command**:
   ```bash
   cd services/api && npx prisma migrate deploy && node dist/main.js
   ```
8. **Port**: `3000`
9. Добавьте переменные окружения (см. раздел "Переменные окружения" ниже)

### 1.3 Создайте Web фронтенд

1. App Platform → Создать приложение
2. GitHub репозиторий: `mss`
3. Название: `mss-web`
4. **Root Directory**: `apps/web`
5. **Build Command**:
   ```bash
   cd ../.. && pnpm install && pnpm build:packages && cd apps/web && pnpm build
   ```
6. **Start Command**:
   ```bash
   cd apps/web && pnpm start
   ```
7. **Port**: `3000`
8. Добавьте переменные окружения

### 1.4 Создайте Admin панель

1. App Platform → Создать приложение
2. GitHub репозиторий: `mss`
3. Название: `mss-admin`
4. **Root Directory**: `apps/admin`
5. **Build Command**:
   ```bash
   cd ../.. && pnpm install && pnpm build:packages && cd apps/admin && pnpm build
   ```
6. **Start Command**:
   ```bash
   cd apps/admin && pnpm start
   ```
7. **Port**: `3000`
8. Добавьте переменные окружения

## Шаг 2: Переменные окружения

### Для API (mss-api)

```env
NODE_ENV=production
PORT=3000

# Database (из Timeweb PostgreSQL)
DATABASE_URL=postgresql://username:password@db-host:5432/mss-production

# JWT
JWT_SECRET=ваш_очень_длинный_секретный_ключ_минимум_32_символа_используйте_генератор
JWT_EXPIRES_IN=7d

# URLs приложений (после создания получите от Timeweb)
FRONTEND_URL=https://mss-web-xxx.timeweb.cloud
ADMIN_URL=https://mss-admin-xxx.timeweb.cloud

# Email (настройте с вашими данными)
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@yandex.ru
```

### Для Web (mss-web)

```env
# API URL (получите после создания mss-api)
NEXT_PUBLIC_API_URL=https://mss-api-xxx.timeweb.cloud
```

### Для Admin (mss-admin)

```env
# API URL (тот же что и для Web)
NEXT_PUBLIC_API_URL=https://mss-api-xxx.timeweb.cloud
```

## Шаг 3: Настройка автоматического деплоя

1. В настройках каждого приложения включите **Auto Deploy**
2. Выберите ветку `main`
3. Теперь при каждом `git push` будет автоматический деплой

## Шаг 4: Настройка доменов (опционально)

1. App Platform → Ваше приложение → Настройки → Домены
2. Добавьте свой домен:
   - `api.ваш-домен.ru` → mss-api
   - `admin.ваш-домен.ru` → mss-admin
   - `ваш-домен.ru` → mss-web
3. Следуйте инструкциям для настройки DNS

## Шаг 5: Первый деплой

```bash
# На локальной машине
git add .
git commit -m "Add Timeweb App Platform configuration"
git push origin main
```

Timeweb App Platform автоматически:
1. Обнаружит изменения в GitHub
2. Запустит сборку
3. Развернет приложения
4. Применит миграции БД
5. Выдаст вам URL для доступа

## Мониторинг

- **Логи**: App Platform → Ваше приложение → Логи
- **Метрики**: App Platform → Ваше приложение → Метрики
- **Статус**: App Platform → Дашборд

## Масштабирование

Если сайт начнет тормозить:

1. App Platform → Ваше приложение → Настройки → Ресурсы
2. Увеличьте CPU/Memory
3. Или добавьте **Horizontal Scaling** (несколько инстансов)

## Бэкапы базы данных

Timeweb автоматически создает бэкапы PostgreSQL, но можно настроить дополнительно:

1. Базы данных → mss-production → Настройки → Резервные копии
2. Настройте расписание

## Стоимость (примерно)

- PostgreSQL: ~300₽/мес
- API (0.5 CPU, 512MB): ~400₽/мес
- Web (0.5 CPU, 512MB): ~400₽/мес
- Admin (0.5 CPU, 512MB): ~400₽/мес

**Итого**: ~1500₽/мес для старта

## Troubleshooting

### Сборка падает с ошибкой "pnpm not found"

Добавьте в корень проекта файл `.npmrc`:
```
auto-install-peers=true
shamefully-hoist=true
```

### Prisma миграции не применяются

Проверьте что в Start Command добавлено:
```bash
npx prisma migrate deploy && node dist/main.js
```

### CORS ошибки

Убедитесь что в API `FRONTEND_URL` и `ADMIN_URL` указаны правильно.

### API не подключается к PostgreSQL

1. Проверьте `DATABASE_URL` в переменных окружения API
2. Убедитесь что БД создана и доступна
3. Проверьте логи: App Platform → mss-api → Логи
