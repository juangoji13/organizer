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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'today':
        return mode === 'clients' ? 'Hoy' : 'Mi Día';
      case 'jobs':
        return 'Trabajos';
      case 'finance':
        return 'Finanzas';
      case 'clients':
        return 'Clientes';
      case 'personal_subjects':
        return 'Materias U';
      case 'personal_goals':
        return 'Metas';
      case 'personal_ideas':
        return 'Ideas Dev';
      case 'personal_savings':
        return 'Ahorro';
      case 'settings':
        return 'Configuración';
      default:
        return 'Organizer';
    }
  };

  const toggleWorkspaceMode = () => {
    const newMode = mode === 'clients' ? 'personal' : 'clients';
    setMode(newMode);
    setActiveTab('today');
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

        {/* Right: Quick Action (+) for Desktop + Fast Workspace Switcher (Clientes ⇄ Personal) */}
        <div className="flex items-center gap-2">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors shadow-xs"
              title="Crear nuevo registro"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {mode === 'clients' ? 'Nuevo Trabajo' : 'Nueva Meta'}
              </span>
            </button>
          )}

          {/* Clean Workspace Toggle (Clientes vs Personal) */}
          <button
            onClick={toggleWorkspaceMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-medium transition-colors min-h-[34px]"
            title="Cambiar enfoque"
            aria-label={`Cambiar a modo ${mode === 'clients' ? 'Personal' : 'Clientes'}`}
          >
            {mode === 'clients' ? (
              <>
                <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-[11px] font-semibold text-zinc-800">Clientes</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span className="text-[11px] font-semibold text-zinc-800">Personal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
