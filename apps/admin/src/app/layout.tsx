import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MSS Admin - Панель управления',
  description: 'Административная панель для управления платформой MSS',
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
