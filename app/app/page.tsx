import Link from 'next/link';

const cards = [
  { title: 'Personas', href: '/app/people', value: '5 evaluados' },
  { title: 'Áreas', href: '/app/org-units', value: '2 áreas' },
  { title: 'Procesos', href: '/app/processes', value: '2 procesos' },
  { title: 'Campañas', href: '/app/campaigns', value: '3 campañas' }
];

export default function AppHome() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl">Dashboard empresa</h1>
        <p className="mt-2 text-slate-600">
          Resumen ejecutivo con KPIs de campañas, heatmaps de brechas y ranking de riesgos.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{card.value}</p>
          </Link>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg">Ranking de riesgos</h2>
        <p className="mt-2 text-sm text-slate-500">
          Muestra las áreas o procesos con bajo score y alta dependencia.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <div className="rounded-lg border border-slate-200 p-4">
            Área Comercial · Score 68 · Dependencias 14
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            Proceso Ventas B2B · Score 71 · Dependencias 10
          </div>
        </div>
      </section>
    </div>
  );
}
