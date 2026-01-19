'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

type RoleType = 'GERENCIA' | 'PARES' | 'AUTO';

type ResultRow = {
  id: string;
  targetName: string;
  orgIndex: number | null;
  blockGerencia: number | null;
  blockPares: number | null;
  blockAuto: number | null;
  perceptionGap: number | null;
  dependencyConcentration: number | null;
  riskLowScore: boolean;
  riskGapHigh: boolean;
  missingRoleTypes: RoleType[];
};

type Summary = {
  orgIndex: number;
  riskCount: number;
  totalTargets: number;
};

interface ResultsDashboardProps {
  campaignName: string;
  summary: Summary | null;
  results: ResultRow[];
}

export default function ResultsDashboard({ campaignName, summary, results }: ResultsDashboardProps) {
  const scoreData = results.map((result) => ({
    name: result.targetName,
    score: result.orgIndex ?? 0,
    gap: result.perceptionGap ?? 0
  }));

  const blockData = results.map((result) => ({
    name: result.targetName,
    gerencia: result.blockGerencia ?? 0,
    pares: result.blockPares ?? 0,
    auto: result.blockAuto ?? 0
  }));

  const dependencyData = results.map((result) => ({
    name: result.targetName,
    concentration: result.dependencyConcentration ?? 0,
    risk: result.riskLowScore || result.riskGapHigh ? 'Riesgo' : 'Estable'
  }));

  const riskRows = results.filter((result) => result.riskLowScore || result.riskGapHigh);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl">Resultados campaña</h1>
            <p className="text-sm text-slate-600">{campaignName}</p>
          </div>
          {summary && (
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-slate-500">Índice organizacional</p>
                <p className="text-lg font-semibold">{summary.orgIndex.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-slate-500">Riesgos</p>
                <p className="text-lg font-semibold">{summary.riskCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Targets</p>
                <p className="text-lg font-semibold">{summary.totalTargets}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg">Índice organizacional por target</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2} />
                <Line type="monotone" dataKey="gap" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg">Bloques ponderados</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="gerencia" fill="#1d4ed8" />
                <Bar dataKey="pares" fill="#0ea5e9" />
                <Bar dataKey="auto" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg">Concentración de dependencias</h2>
          <p className="text-sm text-slate-500">Comparte la proporción de dependencias concentradas en el nodo más citado.</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dependencyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
                <Legend />
                <Bar dataKey="concentration" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg">Riesgos detectados</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {riskRows.length === 0 && <p>Sin riesgos activos.</p>}
            {riskRows.map((result) => (
              <div key={result.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{result.targetName}</p>
                <p>Score: {result.orgIndex?.toFixed(1) ?? 'N/A'}</p>
                <p>Brecha: {result.perceptionGap?.toFixed(1) ?? 'N/A'}</p>
                {result.missingRoleTypes.length > 0 && (
                  <p className="text-xs text-amber-600">
                    Faltan bloques: {result.missingRoleTypes.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg">Detalle por target</h2>
        <div className="mt-4 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-2">Target</th>
                <th className="pb-2">Índice</th>
                <th className="pb-2">Gerencia</th>
                <th className="pb-2">Pares</th>
                <th className="pb-2">Auto</th>
                <th className="pb-2">Brecha</th>
                <th className="pb-2">Dependencias</th>
                <th className="pb-2">Flags</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {results.map((result) => (
                <tr key={result.id} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{result.targetName}</td>
                  <td className="py-3">{result.orgIndex?.toFixed(1) ?? 'N/A'}</td>
                  <td className="py-3">{result.blockGerencia?.toFixed(1) ?? 'N/A'}</td>
                  <td className="py-3">{result.blockPares?.toFixed(1) ?? 'N/A'}</td>
                  <td className="py-3">{result.blockAuto?.toFixed(1) ?? 'N/A'}</td>
                  <td className="py-3">{result.perceptionGap?.toFixed(1) ?? 'N/A'}</td>
                  <td className="py-3">
                    {result.dependencyConcentration !== null
                      ? `${Math.round((result.dependencyConcentration ?? 0) * 100)}%`
                      : 'N/A'}
                  </td>
                  <td className="py-3">
                    {(result.riskLowScore || result.riskGapHigh) && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">Riesgo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
