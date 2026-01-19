export default function LoginPage() {
  return (
    <main className="container py-16">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl">Ingreso administrador</h1>
        <p className="mt-2 text-slate-600">
          Este entorno usa Clerk para autenticar administradores de cada tenant.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-6 text-slate-500">
          Integra el componente de Clerk SignIn en este bloque.
        </div>
      </div>
    </main>
  );
}
