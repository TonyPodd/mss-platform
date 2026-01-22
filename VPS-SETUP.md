# Настройка VPS на Beget для MSS Platform

## Параметры сервера
- **Хостинг:** Beget VPS
- **CPU:** 1 ядро
- **RAM:** 2 GB
- **Диск:** 20 GB SSD
- **ОС:** Ubuntu 22.04 LTS

---

## Шаг 1: Первое подключение к серверу

### 1.1 Получи данные доступа
В панели Beget найди:
- IP адрес сервера (например: `123.45.67.89`)
- Логин (обычно `root`)
- Пароль (из письма или панели управления)

### 1.2 Подключись по SSH

```bash
ssh root@123.45.67.89
```

Введи пароль когда попросит. При первом подключении спросит "Are you sure you want to continue connecting?" - напиши `yes`

---

## Шаг 2: Обновление системы и установка базового ПО

Выполни команды по порядку:

```bash
# Обновить список пакетов
apt update

# Обновить установленные пакеты
apt upgrade -y

# Установить необходимые утилиты
apt install -y curl wget git build-essential
```

---

## Шаг 3: Установка Node.js 20

```bash
# Добавить репозиторий NodeSource для Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Установить Node.js
apt install -y nodejs

# Проверить версию (должно быть 20.x.x)
node --version
npm --version
```

### Установка pnpm

```bash
npm install -g pnpm

# Проверить версию
pnpm --version
```

---

## Шаг 4: Установка PostgreSQL 14

```bash
# Установить PostgreSQL
apt install -y postgresql postgresql-contrib

# Запустить PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Проверить статус
systemctl status postgresql
```

### 4.1 Создание базы данных и пользователя

```bash
# Войти в PostgreSQL
sudo -u postgres psql

# В консоли PostgreSQL выполни:
CREATE DATABASE mss_production;
CREATE USER mss_user WITH ENCRYPTED PASSWORD 'mssadminpassword1489';
GRANT ALL PRIVILEGES ON DATABASE mss_production TO mss_user;
\q
```

**⚠️ ВАЖНО:** Замени `твой_сложный_пароль_123` на свой надёжный пароль и сохрани его!

---

## Шаг 5: Установка PM2

```bash
# Установить PM2 глобально
npm install -g pm2

# Проверить версию
pm2 --version
```

---

## Шаг 6: Установка и настройка NGINX

```bash
# Установить NGINX
apt install -y nginx

# Запустить NGINX
systemctl start nginx
systemctl enable nginx

# Проверить статус
systemctl status nginx
```

### 6.1 Создание конфигурации NGINX

Замени `your-domain.ru` на свой домен (или IP если домена нет):

```bash
# Создать конфигурацию
nano /etc/nginx/sites-available/mss
```

Вставь этот конфиг (используй Ctrl+Shift+V для вставки в терминал):

```nginx
server {
    listen 80;
    server_name 155.212.186.64;

    # Web приложение (клиентская часть)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Загруженные файлы (изображения и т.д.)
    location /uploads {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin панель
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

Сохрани файл: `Ctrl+X`, затем `Y`, затем `Enter`

### 6.2 Активация конфигурации

```bash
# Создать символическую ссылку
ln -s /etc/nginx/sites-available/mss /etc/nginx/sites-enabled/

# Удалить дефолтную конфигурацию
rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию на ошибки
nginx -t

# Перезапустить NGINX
systemctl restart nginx
```

---

## Шаг 7: Клонирование репозитория

```bash
# Перейти в домашнюю директорию
cd /root

# Клонировать репозиторий
git clone https://github.com/TonyPodd/mss-platform.git

# Перейти в папку проекта
cd mss-platform
```

---

## Шаг 8: Настройка переменных окружения

### 8.1 API (.env для services/api)

```bash
nano services/api/.env
```

Вставь (замени значения на свои):

```env
# Database
DATABASE_URL="postgresql://mss_user:mssadminpassword1489@localhost:5432/mss_production"

# JWT
JWT_SECRET="b2c0f45831de1614d67ae900cf9655254ded82fa6cd656441b375b141be9cfd8"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV=production

# CORS
CORS_ORIGIN="http://155.212.186.64"
```

Сохрани: `Ctrl+X`, `Y`, `Enter`

### 8.2 Web (.env для apps/web)

```bash
nano apps/web/.env.production
```

Вставь:

```env
NEXT_PUBLIC_API_URL=http://155.212.186.64/api
```

Сохрани: `Ctrl+X`, `Y`, `Enter`

### 8.3 Admin (.env для apps/admin)

```bash
nano apps/admin/.env.production
```

Вставь:

```env
NEXT_PUBLIC_API_URL=http://155.212.186.64/api
```

Сохрани: `Ctrl+X`, `Y`, `Enter`

---

## Шаг 9: Первый деплой (вручную)

```bash
# Установить зависимости
pnpm install

# Сгенерировать Prisma клиент
pnpm --filter api exec npx prisma generate

# Применить миграции БД
pnpm --filter api exec npx prisma migrate deploy

# Собрать все приложения
pnpm --filter @mss/shared build
pnpm --filter @mss/api-client build
pnpm --filter api build
pnpm --filter web build
pnpm --filter admin build
# sdfsd
# Запустить через PM2
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2 для автозапуска
pm2 save
pm2 startup
```

Последняя команда `pm2 startup` выдаст команду - скопируй и выполни её.

### 9.1 Проверка работы

```bash
# Проверить статус процессов
pm2 status

# Посмотреть логи
pm2 logs
```

Открой браузер и проверь:
- `http://your-domain.ru` - должен открыться сайт
- `http://your-domain.ru/admin` - админка
- `http://your-domain.ru/api/health` - API

---

## Шаг 10: Настройка автодеплоя через GitHub Actions

### 10.1 Создание SSH ключа для GitHub Actions

На VPS сервере:

```bash
# Создать SSH ключ для деплоя (без пароля)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_deploy

# Добавить публичный ключ в authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Вывести приватный ключ (скопируй весь вывод)
cat ~/.ssh/github_deploy
```

Скопируй весь вывод приватного ключа (от `-----BEGIN` до `-----END`)

### 10.2 Добавление секретов в GitHub

1. Открой https://github.com/TonyPodd/mss-platform/settings/secrets/actions
2. Нажми "New repository secret"
3. Создай 3 секрета:

**Секрет 1:**
- Name: `VPS_HOST`
- Value: `123.45.67.89` (твой IP)

**Секрет 2:**
- Name: `VPS_USERNAME`
- Value: `root`

**Секрет 3:**
- Name: `VPS_SSH_KEY`
- Value: (вставь приватный ключ из предыдущего шага)

### 10.3 Сделать deploy.sh исполняемым

На VPS:

```bash
cd /root/mss-platform
chmod +x deploy.sh
```

### 10.4 Обновить .github/workflows/deploy.yml

Проверь что в файле `.github/workflows/deploy.yml` правильный путь к проекту:

```yaml
- name: Deploy to VPS
  run: |
    cd /root/mss-platform
    ./deploy.sh
```

---

## Шаг 11: Тестирование автодеплоя

На твоём локальном компьютере:

```bash
# Создай тестовый коммит
echo "# Test deploy" >> README.md
git add README.md
git commit -m "Test auto-deploy"
git push origin main
```

# Создать пользователя через API
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin_mss@nazare.ru",
    "password": "best_ever_password!",
    "firstName": "Admin",
    "lastName": "User"
  }'

-- Поменять роль на ADMIN (замени email на свой)
UPDATE users SET role = 'ADMIN' WHERE email = 'admin_mss@nazare.ru';

-- Проверить что роль изменилась
SELECT id, email, "firstName", "lastName", role FROM users WHERE email = 'admin_mss@nazare.ru';

\q


Проверь:
1. Открой https://github.com/TonyPodd/mss-platform/actions
2. Должен запуститься workflow "Deploy to VPS"
3. Дождись завершения (зелёная галочка)
4. На сервере проверь: `pm2 logs` - должны быть свежие логи перезапуска

---

## Полезные команды для управления

### PM2 команды

```bash
# Статус процессов
pm2 status

# Логи всех процессов
pm2 logs

# Логи конкретного приложения
pm2 logs api
pm2 logs web
pm2 logs admin

# Перезапустить всё
pm2 restart all

# Перезапустить конкретное приложение
pm2 restart api

# Остановить всё
pm2 stop all

# Мониторинг ресурсов
pm2 monit
```

### NGINX команды

```bash
# Проверить конфигурацию
nginx -t

# Перезапустить
systemctl restart nginx

# Посмотреть логи ошибок
tail -f /var/log/nginx/error.log

# Посмотреть логи доступа
tail -f /var/log/nginx/access.log
```

### PostgreSQL команды

```bash
# Войти в БД
sudo -u postgres psql -d mss_production

# Посмотреть таблицы
\dt

# Выйти
\q
```

### Git команды на сервере

```bash
cd /root/mss-platform

# Посмотреть текущую ветку
git branch

# Обновить код вручную
git pull origin main

# Посмотреть статус
git status
```

---

## Решение частых проблем

### Проблема: "Out of memory"

```bash
# Создать swap файл (2GB)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Проблема: PM2 процессы падают

```bash
# Посмотреть логи
pm2 logs --err

# Увеличить лимит памяти в ecosystem.config.js
# max_memory_restart: '800M' -> '1G'
```

### Проблема: NGINX 502 Bad Gateway

```bash
# Проверить работают ли приложения
pm2 status

# Проверить порты
netstat -tulpn | grep -E '3000|3001|4000'

# Перезапустить всё
pm2 restart all
systemctl restart nginx
```

### Проблема: База данных не подключается

```bash
# Проверить работает ли PostgreSQL
systemctl status postgresql

# Проверить подключение
psql -U mss_user -d mss_production -h localhost

# Если ошибка подключения - проверь DATABASE_URL в services/api/.env
```

---

## Безопасность (опционально, но рекомендуется)

### Настройка файрвола

```bash
# Установить ufw
apt install -y ufw

# Разрешить SSH
ufw allow 22

# Разрешить HTTP/HTTPS
ufw allow 80
ufw allow 443

# Включить файрвол
ufw enable

# Проверить статус
ufw status
```

### Настройка SSL сертификата (бесплатный Let's Encrypt)

```bash
# Установить certbot
apt install -y certbot python3-certbot-nginx

# Получить сертификат (замени на свой домен)
certbot --nginx -d your-domain.ru -d www.your-domain.ru

# Certbot автоматически обновит конфигурацию NGINX
# Автообновление сертификата настроится автоматически
```

---

## Мониторинг и логи

### Просмотр использования ресурсов

```bash
# CPU и память в реальном времени
htop

# Место на диске
df -h

# PM2 мониторинг
pm2 monit
```

### Централизованные логи

```bash
# Все логи PM2
pm2 logs --lines 100

# NGINX access логи
tail -f /var/log/nginx/access.log

# NGINX error логи
tail -f /var/log/nginx/error.log

# PostgreSQL логи
tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## Что дальше?

После настройки сервера:

1. ✅ Проверь что сайт открывается
2. ✅ Проверь что админка работает
3. ✅ Проверь что API отвечает
4. ✅ Сделай тестовый коммит - проверь автодеплой
5. ✅ Настрой домен (если есть)
6. ✅ Установи SSL сертификат
7. ✅ Включи файрвол

**Автодеплой работает так:**
- Ты делаешь `git push` в репозиторий
- GitHub Actions автоматически подключается к VPS
- Запускает `deploy.sh` который обновляет код и перезапускает приложения
- Всё готово!

---

## Контакты и поддержка

Если что-то не работает:
- Проверь логи: `pm2 logs`
- Проверь статус: `pm2 status`
- Проверь NGINX: `nginx -t`
- Проверь PostgreSQL: `systemctl status postgresql`

Beget поддержка: https://beget.com/ru/support
