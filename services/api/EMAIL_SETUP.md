# Настройка Email уведомлений

## Как это работает

Email уведомления используются для отправки сообщений участникам об отмене занятий. Система автоматически отправляет письма всем зачисленным участникам направления, когда администратор отменяет занятие.

## Режимы работы

### Режим разработки (по умолчанию)
Если SMTP настройки не указаны в `.env` файле, система автоматически использует **тестовый SMTP сервер** (ethereal.email):
- Письма **не отправляются** реальным пользователям
- В логах сервера выводится ссылка для просмотра письма
- Пример лога:
  ```
  Email sent to user@example.com: <message-id>
  Preview URL: https://ethereal.email/message/xxxxx
  ```

### Режим продакшена
Для отправки реальных писем настройте SMTP в `.env` файле.

## Настройка Gmail (рекомендуется для начала)

### 1. Включите двухфакторную аутентификацию
1. Перейдите в [Google Account Security](https://myaccount.google.com/security)
2. Включите "2-Step Verification"

### 2. Создайте App Password
1. Перейдите на [App Passwords](https://myaccount.google.com/apppasswords)
2. Выберите "Mail" и "Other (Custom name)"
3. Введите название (например, "MSS Platform")
4. Скопируйте сгенерированный 16-значный пароль

### 3. Обновите .env файл
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM="MSS Студия <noreply@yourdomain.com>"
```

### 4. Перезапустите сервер
```bash
pnpm --filter api dev
```

## Другие SMTP провайдеры

### Yandex Mail
```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-password
SMTP_FROM="MSS Студия <noreply@yourdomain.com>"
```

### Mail.ru
```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@mail.ru
SMTP_PASS=your-password
SMTP_FROM="MSS Студия <noreply@yourdomain.com>"
```

### SendGrid (профессиональный сервис)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM="MSS Студия <verified-sender@yourdomain.com>"
```

## Проверка настройки

1. Запустите сервер:
   ```bash
   pnpm --filter api dev
   ```

2. В админке отмените любое занятие направления

3. Проверьте логи сервера:
   - **Тестовый режим**: увидите ссылку для просмотра письма
   - **Продакшен**: увидите "Email sent to ..." с message ID

4. Проверьте почту получателя (в продакшен режиме)

## Устранение проблем

### Gmail: "Less secure app access"
Gmail больше не поддерживает "less secure apps". Обязательно используйте **App Password**.

### Ошибка "Authentication failed"
- Проверьте правильность email и пароля
- Убедитесь что используете App Password (для Gmail)
- Проверьте что SMTP_SECURE соответствует порту

### Письма не приходят
1. Проверьте папку "Спам"
2. Убедитесь что SMTP настройки правильные
3. Проверьте логи сервера на наличие ошибок
4. Попробуйте отправить тестовое письмо через веб-интерфейс почты

### Timeout errors
- Проверьте firewall и антивирус
- Попробуйте другой порт (587 или 465)
- Проверьте настройку SMTP_SECURE

## Содержимое письма

При отмене занятия участники получают письмо с:
- Названием направления
- Датой и временем отмененного занятия
- Причиной отмены (указанной администратором)
- Информацией о том, что остальные занятия проходят по расписанию

## Для продакшена

Рекомендации для production окружения:
1. Используйте профессиональный SMTP сервис (SendGrid, Amazon SES, Mailgun)
2. Настройте SPF, DKIM, DMARC записи для вашего домена
3. Используйте верифицированный домен в SMTP_FROM
4. Мониторьте статус доставки писем
5. Настройте rate limiting для предотвращения спама
