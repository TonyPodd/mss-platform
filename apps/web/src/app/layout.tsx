import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ToastContainer } from '../components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'На заре - Творческое пространство',
  description: 'Творческое пространство для мастер-классов и направлений',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
