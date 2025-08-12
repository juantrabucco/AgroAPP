'use client';
import { AuthProvider } from '@/lib/auth';
import Shell from './shell';

export const metadata = { title: 'Agro Starter', description: 'Gestión agro/ganadera' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
