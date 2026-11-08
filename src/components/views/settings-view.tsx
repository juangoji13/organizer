'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { Briefcase, UserCheck, Database, Sun, Moon } from 'lucide-react';

export function SettingsView() {
  const { mode, setMode, setActiveTab, theme, setTheme } = useWorkspace();

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Configuración & Espacio de Trabajo
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Alterna entre el modo de gestión de clientes y tu espacio personal, y administra tus preferencias de tema visual.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance & OLED Dark Mode Theme Selector */}
        <div className="p-6 rounded-xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#121215] shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Apariencia & Tema Visual
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold border border-zinc-200/60 dark:border-white/5">
              {theme === 'dark' ? 'OLED Nocturno' : 'Porcelana Minimal'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Selecciona tu estilo de visualización preferido. Disfruta de la porcelana minimalista en entornos diurnos o de la profundidad del negro OLED (#000000 / #09090b) en sesiones nocturnas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Modo Claro (Porcelana Minimal) */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === 'light'
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-white/20 dark:bg-zinc-100 dark:text-zinc-950'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 text-zinc-900 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    theme === 'light'
                      ? 'bg-white/15 text-amber-300 dark:bg-zinc-900/10 dark:text-amber-600'
                      : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </div>
                {theme === 'light' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white dark:bg-zinc-900/15 dark:text-zinc-950">
                    Activo
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">Modo Claro</div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  theme === 'light' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Porcelana Minimal
              </div>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  theme === 'light' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Paleta blanca pulida, alto contraste y sombras suaves pensadas para claridad diurna.
              </p>
            </button>

            {/* Option 2: Modo Oscuro (OLED Nocturno) */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === 'dark'
                  ? 'border-white/30 bg-[#18181b] text-white shadow-sm ring-1 ring-white/20'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 text-zinc-900 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-white/15 text-sky-300'
                      : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                </div>
                {theme === 'dark' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    Activo
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">Modo Oscuro</div>
              <div
                className={`text-[11px] font-medium mt-0.5 ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                OLED Nocturno
              </div>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Fondo negro puro OLED (#000000 / #09090b), bordes sutiles y confort visual nocturno.
              </p>
            </button>
          </div>
        </div>

        {/* Workspace Switcher Section */}
        <div className="p-6 rounded-xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#121215] shadow-xs">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Espacio de Trabajo Activo
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Selecciona el entorno en el que deseas concentrarte hoy. La barra lateral y las listas se adaptarán automáticamente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode Option 1: Clients */}
            <button
              onClick={() => {
                setMode('clients');
                setActiveTab('today');
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === 'clients'
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-white/20 dark:bg-zinc-100 dark:text-zinc-950'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 text-zinc-900 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Briefcase className={`w-5 h-5 ${mode === 'clients' ? 'text-white dark:text-zinc-950' : 'text-zinc-600 dark:text-zinc-400'}`} />
                {mode === 'clients' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white dark:bg-zinc-900/15 dark:text-zinc-950">
                    Activo
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">Modo Clientes</div>
              <p className={`text-xs mt-1 leading-relaxed ${mode === 'clients' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                Trabajos para otros, credenciales de portales, cobros pendientes y WhatsApp.
              </p>
            </button>

            {/* Mode Option 2: Personal */}
            <button
              onClick={() => {
                setMode('personal');
                setActiveTab('personal');
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === 'personal'
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm dark:border-white/20 dark:bg-zinc-100 dark:text-zinc-950'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/70 text-zinc-900 dark:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <UserCheck className={`w-5 h-5 ${mode === 'personal' ? 'text-white dark:text-zinc-950' : 'text-zinc-600 dark:text-zinc-400'}`} />
                {mode === 'personal' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white dark:bg-zinc-900/15 dark:text-zinc-950">
                    Activo
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">Modo Personal</div>
              <p className={`text-xs mt-1 leading-relaxed ${mode === 'personal' ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400'}`}>
                Mis materias de la U, metas de estudio, ideas de programación y planes de ahorro.
              </p>
            </button>
          </div>
        </div>

        {/* Backend & Security Status */}
        <div className="p-6 rounded-xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#121215] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Conexión Supabase PostgreSQL
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Almacenamiento seguro en la nube con Row Level Security (RLS) habilitado.
          </p>

          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {isSupabaseConfigured ? 'Supabase Enlazado (.env.local)' : 'Esperando Credenciales (.env.local)'}
              </span>
            </div>
            <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
              {isSupabaseConfigured ? 'Ready' : 'Pending Keys'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
