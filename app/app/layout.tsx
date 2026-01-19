import Link from 'next/link';
import type { ReactNode } from 'react';

const navigation = [
  { href: '/app', label: 'Dashboard' },
  { href: '/app/org-units', label: 'Áreas' },
  { href: '/app/people', label: 'Personas' },
  { href: '/app/processes', label: 'Procesos' },
  { href: '/app/instruments', label: 'Instrumentos' },
  { href: '/app/campaigns', label: 'Campañas' },
  { href: '/app/results', label: 'Resultados' }
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Vlex Consulting</p>
            <p className="text-xs text-slate-500">Panel multi-tenant</p>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
