'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { Briefcase, UserCheck, Plus } from 'lucide-react';

interface TopHeaderProps {
  onOpenCreateModal?: () => void;
}

export function TopHeader({ onOpenCreateModal }: TopHeaderProps) {
  const { mode, setMode, activeTab, setActiveTab } = useWorkspace();
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    const formatted = new Date().toLocaleDateString('es-ES', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
    setDateString(formatted.replace('.', ''));
  }, []);

  const isPersonalEnvironment = activeTab === 'personal' || activeTab.startsWith('personal_');

  const getTabTitle = () => {
    switch (activeTab) {
      case 'today':
        return 'Hoy';
      case 'jobs':
        return 'Trabajos';
      case 'finance':
        return 'Finanzas';
      case 'clients':
        return 'Clientes';
      case 'personal':
      case 'personal_subjects':
      case 'personal_goals':
      case 'personal_ideas':
      case 'personal_savings':
        return 'Mi Espacio';
      case 'settings':
        return 'Configuración';
      default:
        return 'Organizer';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/88 backdrop-blur-md border-b border-zinc-200/80 pt-safe px-4 sm:px-8 py-2.5 sm:py-3 select-none">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: View Title and Date */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight truncate">
              {getTabTitle()}
            </span>
            <span className="text-[11px] text-zinc-500 capitalize hidden sm:inline">
              {dateString}
            </span>
          </div>
        </div>

        {/* Right: Quick Action (+) for Desktop + Subtle Environment Selector / Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors shadow-xs"
              title="Crear nuevo registro"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Registro</span>
            </button>
          )}

          {/* Subtle Environment Indicator / Selector */}
          <div className="inline-flex items-center p-0.5 bg-zinc-100/90 border border-zinc-200/70 rounded-lg text-xs select-none">
            <button
              type="button"
              onClick={() => {
                setMode('clients');
                if (isPersonalEnvironment) {
                  setActiveTab('today');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                !isPersonalEnvironment
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 font-medium'
              }`}
              aria-label="Entorno Clientes"
              title="Entorno Clientes & Encargos"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="text-[11px]">Clientes</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('personal');
                setActiveTab('personal');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                isPersonalEnvironment
                  ? 'bg-white text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 font-medium'
              }`}
              aria-label="Entorno Mi Espacio"
              title="Entorno Mi Espacio Personal"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="text-[11px]">Mi Espacio</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
