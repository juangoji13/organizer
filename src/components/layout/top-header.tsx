'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { Plus } from 'lucide-react';

interface TopHeaderProps {
  onOpenCreateModal?: () => void;
}

export function TopHeader({ onOpenCreateModal }: TopHeaderProps) {
  const { activeTab } = useWorkspace();
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
    <header className="sticky top-0 z-30 bg-white/88 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/10 pt-safe px-4 sm:px-8 py-2.5 sm:py-3 select-none">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: View Title and Subtle Date */}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50 tracking-tight truncate">
              {getTabTitle()}
            </span>
            {dateString && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium capitalize">
                {dateString}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action (+) for Desktop if applicable */}
        {onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-semibold transition-colors shadow-xs"
            title="Crear nuevo registro"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Registro</span>
          </button>
        )}
      </div>
    </header>
  );
}
