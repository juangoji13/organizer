import { 
  CheckCircle2, 
  Layers, 
  Database, 
  Cloud, 
  Smartphone, 
  GitBranch,
  ArrowRight
} from "lucide-react";

export default function Home() {
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Header */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
            O
          </div>
          <div>
            <h1 className="font-semibold text-sm text-zinc-100">Organizer</h1>
            <p className="text-xs text-zinc-400">Trabajos Personales & Clientes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Fase 1: Setup Listo
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
            <span>Next.js 16 (App Router)</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>Tailwind v4</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
            Estructura base configurada
          </h2>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-xl">
            El entorno de desarrollo está preparado con integración a Vercel, conectividad con Supabase, soporte PWA y estándares de Git / Conventional Commits.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Vercel */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-300">
                  <Cloud className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200">Vercel Deployment</h3>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Proyecto vinculado a <span className="text-zinc-200 font-mono">organizer</span> en Vercel. Despliegues continuos automáticos configurados con CI/CD.
            </p>
          </div>

          {/* Card 2: Supabase */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-300">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200">Supabase Backend</h3>
              </div>
              {isSupabaseConfigured ? (
                <span className="text-xs font-mono text-emerald-400">Conectado</span>
              ) : (
                <span className="text-xs font-mono text-amber-400">Listo para enlazar</span>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Clientes SSR, navegador y middleware listos en <span className="text-zinc-200 font-mono">src/lib/supabase/</span>. Variables en <span className="text-zinc-200 font-mono">.env.example</span>.
            </p>
          </div>

          {/* Card 3: PWA */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200">PWA & Offline</h3>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Manifest web <span className="text-zinc-200 font-mono">manifest.ts</span> y Service Worker <span className="text-zinc-200 font-mono">sw.js</span> preparados para instalación en móvil y escritorio.
            </p>
          </div>

          {/* Card 4: Conventions */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-800/60 text-zinc-300">
                  <GitBranch className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200">Git & Convenciones</h3>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Estructura de ramas permanentes (<span className="text-zinc-200 font-mono">main</span>, <span className="text-zinc-200 font-mono">dev</span>) y Conventional Commits configurada.
            </p>
          </div>
        </div>

        {/* Next Steps callout */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-zinc-900/80 to-zinc-900/30 border border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Siguiente paso recomendado</h4>
            <p className="text-sm text-zinc-200 mt-0.5">Definir el modelo de datos básico (clientes, proyectos, tareas y tipo de trabajo).</p>
          </div>
          <div className="hidden sm:flex items-center text-xs text-zinc-400 font-mono gap-1">
            <span>Fase 2</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 px-6 py-4 text-center text-xs text-zinc-400">
        Organizer &copy; 2026 — Configuración inicial completada.
      </footer>
    </div>
  );
}
