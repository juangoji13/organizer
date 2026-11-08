'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { Menu, Settings as SettingsIcon } from 'lucide-react';

export function TopHeader() {
  const { mode, activeTab, setActiveTab, setIsSidebarOpen } = useWorkspace();
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    );
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'today':
        return mode === 'clients' ? 'Hoy • Entregas Prioritarias' : 'Hoy • Mi Día';
      case 'jobs':
        return 'Todos los Trabajos';
      case 'finance':
        return 'Finanzas & Cobros';
      case 'clients':
        return 'Directorio de Clientes';
      case 'personal_subjects':
        return 'Mis Materias Universitarias';
      case 'personal_goals':
        return 'Metas de Estudio';
      case 'personal_ideas':
        return 'Ideas & Proyectos Dev';
      case 'personal_savings':
        return 'Planes de Ahorro';
      case 'settings':
        return 'Configuración & Preferencias';
      default:
        return 'Organizer';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors"
          aria-label="Abrir navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight">
            {getTabTitle()}
          </h2>
          <p className="hidden sm:block text-xs text-zinc-400 capitalize">
            {dateString}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60">
          {mode === 'clients' ? 'Clientes' : 'Personal'}
        </span>
        <button
          onClick={() => setActiveTab('settings')}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          title="Configuración"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
