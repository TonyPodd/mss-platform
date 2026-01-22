import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход - MSS Admin',
  description: 'Вход в административную панель MSS',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
