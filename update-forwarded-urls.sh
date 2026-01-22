#!/bin/bash

# Скрипт для обновления URL после проброса портов в VS Code

echo "🔧 Обновление URL для проброшенных портов..."
echo ""

# Запрос URL для API (порт 3000)
read -p "Введите проброшенный URL для API (порт 3000): " API_URL

if [ -z "$API_URL" ]; then
    echo "❌ URL не может быть пустым!"
    exit 1
fi

# Обновление apps/web/.env.local
echo "NEXT_PUBLIC_API_URL=$API_URL" > apps/web/.env.local
echo "✅ Обновлен apps/web/.env.local"

# Обновление apps/admin/.env.local
echo "NEXT_PUBLIC_API_URL=$API_URL" > apps/admin/.env.local
echo "✅ Обновлен apps/admin/.env.local"

echo ""
echo "✨ Готово! Теперь перезапустите фронтенд приложения:"
echo "   pnpm dev:web"
echo "   pnpm dev:admin"
