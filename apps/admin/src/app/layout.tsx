import type { Metadata } from 'next';
import Sidebar from '../components/Sidebar';
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
      <body>
        <div className="admin-layout">
          <Sidebar />
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
