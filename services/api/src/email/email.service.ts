import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Для разработки используем ethereal.email (тестовый SMTP)
    // В продакшене нужно настроить реальный SMTP сервер через переменные окружения
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      // Продакшен конфигурация
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.logger.log('Email service initialized with production SMTP');
    } else {
      // Разработка - используем тестовый аккаунт
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(
        `Email service initialized with test account: ${testAccount.user}`,
      );
      this.logger.log('Preview emails at: https://ethereal.email');
    }
  }

  async sendSessionCancellationEmail(
    to: string,
    userName: string,
    groupName: string,
    sessionDate: Date,
    reason?: string,
  ): Promise<void> {
    const formattedDate = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(sessionDate));

    const mailOptions = {
      from: process.env.SMTP_FROM || '"MSS Студия" <noreply@mss-studio.ru>',
      to,
      subject: `Отмена занятия: ${groupName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Уведомление об отмене занятия</h2>

          <p>Здравствуйте, ${userName}!</p>

          <p>К сожалению, занятие по направлению <strong>${groupName}</strong>, запланированное на <strong>${formattedDate}</strong>, отменено.</p>

          ${reason ? `<p><strong>Причина:</strong> ${reason}</p>` : ''}

          <p>Приносим свои извинения за доставленные неудобства.</p>

          <p>Все остальные занятия проходят по расписанию.</p>

          <hr style="border: 1px solid #eee; margin: 20px 0;">

          <p style="color: #666; font-size: 12px;">
            С уважением,<br>
            Команда MSS Студия
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);

      // Для тестового сервера выводим ссылку на просмотр
      if (!process.env.SMTP_HOST) {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
