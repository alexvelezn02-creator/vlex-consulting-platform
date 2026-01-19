const scale = [
  { value: 30, label: 'Insuficiente' },
  { value: 50, label: 'Regular' },
  { value: 70, label: 'Mejorable' },
  { value: 80, label: 'Bueno' },
  { value: 90, label: 'Muy bueno' },
  { value: 100, label: 'Excelente' }
];

const demoQuestions = [
  {
    section: 'Colaboración y liderazgo',
    items: [
      'Promueve la coordinación entre áreas clave.',
      'Entrega feedback oportuno para mejorar el desempeño.'
    ]
  },
  {
    section: 'Resultados y ejecución',
    items: [
      'Cumple compromisos críticos en tiempo y forma.',
      'Gestiona prioridades con foco en impacto.'
    ]
  }
];

const dependencyOptions = [
  'Equipo Comercial',
  'Equipo Operaciones',
  'Equipo Finanzas',
  'Carla Pérez (Gerencia)',
  'Diego Morales (Ventas)'
];

export default function TokenFormPage({ params }: { params: { token: string } }) {
  return (
    <main className="container py-10">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl">Evaluación 360°</h1>
        <p className="mt-2 text-sm text-slate-600">
          Token {params.token} · Responde de forma anónima. Esta evaluación se usa para diagnóstico organizacional.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg">Escala de evaluación</h2>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
            {scale.map((item) => (
              <div key={item.value} className="rounded-lg bg-white px-3 py-2">
                <span className="font-semibold text-slate-800">{item.value}</span> · {item.label}
              </div>
            ))}
          </div>
        </section>

        <form className="mt-8 space-y-8">
          {demoQuestions.map((section) => (
            <section key={section.section} className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg">{section.section}</h3>
              <div className="mt-4 space-y-4">
                {section.items.map((question) => (
                  <div key={question} className="space-y-3">
                    <p className="text-sm text-slate-700">{question}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {scale.map((item) => (
                        <label key={item.value} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                          <input type="radio" name={question} value={item.value} className="accent-slate-900" />
                          {item.value}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg">Dependencias</h3>
            <p className="mt-1 text-sm text-slate-600">
              Para hacer bien mi trabajo, dependo principalmente de:
            </p>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              {dependencyOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                  <input type="checkbox" name="dependency_nodes" value={option} className="accent-slate-900" />
                  {option}
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">¿Es un cuello de botella hoy?</span>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">¿En qué falla?</span>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-2">
                  <option value="TIME">Tiempo</option>
                  <option value="APPROVAL">Aprobaciones</option>
                  <option value="INFO">Información</option>
                  <option value="QUALITY">Calidad</option>
                  <option value="RESOURCES">Recursos</option>
                  <option value="OTHER">Otro</option>
                </select>
              </label>
            </div>

            <label className="mt-6 block text-sm">
              <span className="font-medium text-slate-700">Comentario opcional</span>
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={4}
                placeholder="Describe brevemente la dependencia o el cuello de botella."
              />
            </label>
          </section>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white"
          >
            Enviar evaluación
          </button>
        </form>
      </div>
    </main>
  );
}
