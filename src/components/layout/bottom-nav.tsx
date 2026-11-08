'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { 
  CalendarCheck, 
  Layers, 
  Users,
  Plus,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  onOpenCreateModal?: () => void;
}

export function BottomNav({ onOpenCreateModal }: BottomNavProps) {
  const { activeTab, setActiveTab, jobs, clients } = useWorkspace();

  const pendingUrgentCount = jobs.filter((j) => j.isUrgentToday && j.status !== 'delivered').length;
  const hasPendingDebt = clients.some((c) => c.totalPending > 0);

  const isPersonalActive = activeTab === 'personal' || activeTab.startsWith('personal_');

  return (
    <nav 
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-black/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-white/10 bottom-nav-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] select-none"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-md mx-auto">
        {/* Tab 1: Hoy */}
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
            activeTab === 'today' ? 'text-zinc-950 dark:text-white font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          aria-label="Hoy"
        >
          <div className="relative">
            <CalendarCheck className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
            {pendingUrgentCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-bold flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 tabular-nums">
                {pendingUrgentCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Hoy</span>
        </button>

        {/* Tab 2: Trabajos */}
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
            activeTab === 'jobs' ? 'text-zinc-950 dark:text-white font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          aria-label="Trabajos"
        >
          <Layers className={`w-5 h-5 ${activeTab === 'jobs' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Trabajos</span>
        </button>

        {/* Tab 3: Central Action (+) Ergonomic Creator */}
        <div className="flex-1 flex justify-center items-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onOpenCreateModal}
            className="w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            title="Crear nuevo registro"
            aria-label="Crear nuevo registro"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Tab 4: Clientes */}
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
            activeTab === 'clients' ? 'text-zinc-950 dark:text-white font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          aria-label="Clientes"
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === 'clients' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
            {hasPendingDebt && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white dark:ring-black" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Clientes</span>
        </button>

        {/* Tab 5: Mi Espacio */}
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
            isPersonalActive ? 'text-zinc-950 dark:text-white font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          aria-label="Mi Espacio"
        >
          <Sparkles className={`w-5 h-5 ${isPersonalActive ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Mi Espacio</span>
        </button>
      </div>
    </nav>
  );
}
