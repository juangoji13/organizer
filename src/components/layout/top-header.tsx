'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { Menu, Settings as SettingsIcon, Briefcase, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function TopHeader() {
  const { mode, setMode, activeTab, setActiveTab, setIsSidebarOpen } = useWorkspace();
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
    <header className="sticky top-0 z-30 bg-white/92 backdrop-blur-xl border-b border-zinc-200/80 pt-safe px-3.5 sm:px-8 py-2.5 sm:py-3 select-none">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Mobile Menu Trigger & View Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Abrir navegación principal"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight truncate">
                {getTabTitle()}
              </h2>
              {dateString && (
                <span className="text-[11px] text-zinc-400 capitalize hidden xs:inline-block font-mono">
                  • {dateString}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Workspace Switcher & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Workspace Pill: 1-Tap Toggle between Clientes and Personal */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={toggleWorkspaceMode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all min-h-[36px]"
            title={`Cambiar a modo ${mode === 'clients' ? 'Personal' : 'Clientes'}`}
          >
            {mode === 'clients' ? (
              <span className="flex items-center gap-1.5 text-zinc-800 bg-zinc-100/90 border border-zinc-200/70 px-2 py-0.5 rounded-md">
                <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                <span>Clientes</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-900 bg-zinc-200/80 border border-zinc-300/70 px-2 py-0.5 rounded-md">
                <UserCheck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Personal</span>
              </span>
            )}
          </motion.button>

          {/* Settings Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
              activeTab === 'settings'
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100/80'
            }`}
            title="Configuración"
            aria-label="Ir a configuración"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
