import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MSS Platform - Мастер-классы и творческие занятия',
  description: 'Платформа для записи на мастер-классы и творческие занятия',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
