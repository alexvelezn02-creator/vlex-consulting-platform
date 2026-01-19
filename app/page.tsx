import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container py-16">
      <div className="rounded-3xl bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold">Vlex Consulting Platform</h1>
        <p className="mt-4 text-slate-600">
          Plataforma org-centric de evaluaciones 360° / 180° y diagnóstico organizacional
          con mapa de dependencias.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/login">
            Ingresar
          </Link>
          <Link className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium" href="/r/demo-token">
            Probar evaluación
          </Link>
        </div>
      </div>
    </main>
  );
}
