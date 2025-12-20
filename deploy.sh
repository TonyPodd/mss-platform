#!/bin/bash

# Деплой скрипт для MSS проекта
echo "🚀 Начало деплоя..."

# Переходим в директорию проекта
cd /var/www/mss

# Останавливаем приложения
echo "⏸️  Останавливаем приложения..."
pm2 stop all

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

# Собираем приложения
echo "🔨 Собираем API..."
pnpm --filter api build

echo "🔨 Собираем Web..."
pnpm --filter web build

echo "🔨 Собираем Admin..."
pnpm --filter admin build

# Перезапускаем приложения
echo "🔄 Перезапускаем приложения..."
pm2 restart all

# Показываем статус
echo "✅ Деплой завершен!"
pm2 status
