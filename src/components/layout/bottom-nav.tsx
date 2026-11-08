'use client';

import React from 'react';
import { useWorkspace } from '@/context/workspace-context';
import { 
  CalendarCheck, 
  Layers, 
  CreditCard, 
  Users,
  Plus,
  GraduationCap,
  Sparkles,
  PiggyBank
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  onOpenCreateModal?: () => void;
}

export function BottomNav({ onOpenCreateModal }: BottomNavProps) {
  const { mode, activeTab, setActiveTab, jobs, clients } = useWorkspace();

  const pendingUrgentCount = jobs.filter((j) => j.isUrgentToday && j.status !== 'delivered').length;
  const hasPendingDebt = clients.some((c) => c.totalPending > 0);

  return (
    <nav 
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-zinc-200/80 bottom-nav-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] select-none"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-md mx-auto">
        {mode === 'clients' ? (
          <>
            {/* Hoy */}
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'today' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <div className="relative">
                <CalendarCheck className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
                {pendingUrgentCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-bold flex items-center justify-center bg-zinc-900 text-white tabular-nums">
                    {pendingUrgentCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Hoy</span>
            </button>

            {/* Trabajos */}
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'jobs' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Layers className={`w-5 h-5 ${activeTab === 'jobs' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Trabajos</span>
            </button>

            {/* Central Action: (+) 48x48px Ergonomic Creator */}
            <div className="flex-1 flex justify-center items-center">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenCreateModal}
                className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:bg-zinc-800 transition-colors"
                title="Crear nuevo registro"
                aria-label="Crear nuevo registro"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Clientes */}
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'clients' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Users className={`w-5 h-5 ${activeTab === 'clients' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Clientes</span>
            </button>

            {/* Finanzas */}
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'finance' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <div className="relative">
                <CreditCard className={`w-5 h-5 ${activeTab === 'finance' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
                {hasPendingDebt && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Finanzas</span>
            </button>
          </>
        ) : (
          <>
            {/* Personal: Mi Día */}
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'today' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <CalendarCheck className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Mi Día</span>
            </button>

            {/* Personal: Materias U */}
            <button
              onClick={() => setActiveTab('personal_subjects')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'personal_subjects' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${activeTab === 'personal_subjects' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Materias</span>
            </button>

            {/* Central Action: (+) 48x48px Ergonomic Creator */}
            <div className="flex-1 flex justify-center items-center">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onOpenCreateModal}
                className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] hover:bg-zinc-800 transition-colors"
                title="Crear nuevo registro"
                aria-label="Crear nuevo registro"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Personal: Ideas & Notas */}
            <button
              onClick={() => setActiveTab('personal_ideas')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'personal_ideas' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${activeTab === 'personal_ideas' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Ideas & Notas</span>
            </button>

            {/* Personal: Ahorro */}
            <button
              onClick={() => setActiveTab('personal_savings')}
              className={`flex-1 flex flex-col items-center py-1.5 min-h-[48px] justify-center rounded-xl transition-colors ${
                activeTab === 'personal_savings' ? 'text-zinc-950 font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <PiggyBank className={`w-5 h-5 ${activeTab === 'personal_savings' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Ahorro</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
