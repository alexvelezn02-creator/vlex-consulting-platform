import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Vlex Consulting Platform',
  description: 'Evaluaciones 360/180 y diagnóstico organizacional'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-slate-50">
          {children}
        </div>
      </body>
    </html>
  );
}
