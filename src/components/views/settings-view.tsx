'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { Briefcase, UserCheck, Database, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function SettingsView() {
  const { mode, setMode, setActiveTab } = useWorkspace();

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-7 px-3.5 sm:px-6">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
          Configuración & Espacio de Trabajo
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Alterna entre el modo de gestión de clientes y tu espacio personal, y administra tus preferencias.
        </p>
      </div>

      <div className="space-y-6">
        {/* Workspace Switcher Section */}
        <div className="p-6 rounded-xl border border-zinc-200/90 bg-white shadow-xs">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">
            Espacio de Trabajo Activo
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
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
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Briefcase className={`w-5 h-5 ${mode === 'clients' ? 'text-white' : 'text-zinc-600'}`} />
                {mode === 'clients' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    Activo
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">Modo Clientes</div>
              <p className={`text-xs mt-1 leading-relaxed ${mode === 'clients' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                Trabajos para otros, credenciales de portales, cobros pendientes y WhatsApp.
              </p>
            </button>

            {/* Mode Option 2: Personal */}
            <button
              onClick={() => {
                setMode('personal');
                setActiveTab('personal_subjects');
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === 'personal'
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                  : 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 text-zinc-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <UserCheck className={`w-5 h-5 ${mode === 'personal' ? 'text-white' : 'text-zinc-600'}`} />
                {mode === 'personal' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                    Activo
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">Modo Personal</div>
              <p className={`text-xs mt-1 leading-relaxed ${mode === 'personal' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                Mis materias de la U, metas de estudio, ideas de programación y planes de ahorro.
              </p>
            </button>
          </div>
        </div>

        {/* Backend & Security Status */}
        <div className="p-6 rounded-xl border border-zinc-200/90 bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-zinc-600" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Conexión Supabase PostgreSQL
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Almacenamiento seguro en la nube con Row Level Security (RLS) habilitado.
          </p>

          <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-medium text-zinc-700">
                {isSupabaseConfigured ? 'Supabase Enlazado (.env.local)' : 'Esperando Credenciales (.env.local)'}
              </span>
            </div>
            <span className="text-zinc-400 font-mono text-[11px]">
              {isSupabaseConfigured ? 'Ready' : 'Pending Keys'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
