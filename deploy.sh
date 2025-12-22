#!/bin/bash

# Деплой скрипт для MSS проекта
echo "🚀 Начало деплоя..."

# Переходим в директорию проекта
cd /root/mss-platform

# Останавливаем приложения
echo "⏸️  Останавливаем приложения..."
pm2 stop mss-web mss-admin mss-api

# Получаем последние изменения
echo "📥 Получаем обновления из GitHub..."
git pull origin main

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
pnpm install

# Генерируем Prisma Client
echo "🔄 Генерируем Prisma Client..."
pnpm --filter api exec npx prisma generate

# Запускаем миграции
echo "🗄️  Применяем миграции базы данных..."
pnpm --filter api exec npx prisma migrate deploy

# Собираем общие пакеты
echo "🔨 Собираем Shared..."
pnpm --filter @mss/shared build

echo "🔨 Собираем API Client..."
pnpm --filter @mss/api-client build

# Собираем приложения
echo "🔨 Собираем API..."
pnpm --filter api build

echo "🔨 Собираем Web..."
pnpm --filter web build

echo "🔨 Собираем Admin..."
pnpm --filter admin build

# Перезапускаем приложения
echo "🔄 Перезапускаем приложения..."
pm2 restart mss-api mss-web mss-admin

# Показываем статус
echo "✅ Деплой завершен!"
pm2 status
