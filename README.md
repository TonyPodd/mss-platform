# MSS Platform

Платформа для записи на мастер-классы и творческие занятия.

## Структура проекта

Монорепозиторий с использованием pnpm workspaces:

```
mss-platform/
├── apps/
│   ├── mobile/          # React Native + Expo приложение
│   ├── web/             # Next.js веб-сайт
│   └── admin/           # Next.js админ-панель
├── packages/
│   ├── shared/          # Общие типы и константы
│   ├── ui/              # Переиспользуемые UI компоненты
│   └── api-client/      # HTTP клиент для API
└── services/
    └── api/             # NestJS backend + Prisma
```

## Технологический стек

- **Frontend (Web/Admin):** Next.js 14 (App Router), TypeScript, React 18
- **Mobile:** React Native, Expo
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL
- **Monorepo:** pnpm workspaces

## Требования

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14

## Установка

1. Клонировать репозиторий:
```bash
git clone https://github.com/TonyPodd/mss-platform.git
cd mss-platform
```

2. Установить зависимости:
```bash
pnpm install
```

3. Настроить базу данных:
```bash
# Создать .env файл в services/api/
cp services/api/.env.example services/api/.env

# Отредактировать DATABASE_URL в .env
# Применить миграции
cd services/api
pnpm prisma migrate dev
pnpm prisma generate
cd ../..
```

## Запуск для разработки

### Запустить все приложения:

```bash
# Backend API (порт 3000)
pnpm dev:api

# Веб-сайт (порт 3001)
pnpm dev:web

# Админка (порт 3002)
pnpm dev:admin

# Mobile приложение
pnpm dev:mobile
```

### API документация

После запуска API, Swagger документация доступна по адресу:
http://localhost:3000/api/docs

## Сборка для продакшена

```bash
# Собрать все приложения
pnpm build:web
pnpm build:admin
pnpm build:api
pnpm build:mobile
```

## Основной функционал

### Мобильное приложение и веб-сайт:
- Главная страница с новостной лентой
- Календарь событий (Google Calendar style)
- Запись на мастер-классы
- Постоянные группы (направления)
- Страница мастеров
- Интернет-магазин

### Админ-панель:
- Управление событиями и мастер-классами
- Управление пользователями и записями
- Управление товарами
- Управление новостями

## Разработка

### Создание новых модулей в API:
```bash
cd services/api
pnpm nest g module <module-name>
pnpm nest g controller <controller-name>
pnpm nest g service <service-name>
```

### Работа с базой данных:
```bash
cd services/api

# Создать миграцию
pnpm prisma migrate dev --name <migration-name>

# Применить миграции
pnpm prisma migrate deploy

# Открыть Prisma Studio
pnpm prisma studio
```

## Скрипты

- `pnpm dev:web` - запустить веб-сайт
- `pnpm dev:admin` - запустить админку
- `pnpm dev:mobile` - запустить мобильное приложение
- `pnpm dev:api` - запустить backend
- `pnpm build:web` - собрать веб-сайт
- `pnpm build:admin` - собрать админку
- `pnpm build:api` - собрать backend
- `pnpm lint` - проверить код линтером
- `pnpm format` - форматировать код
- `pnpm type-check` - проверить типы TypeScript

## Лицензия

Private
