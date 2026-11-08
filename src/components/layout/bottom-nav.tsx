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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/94 backdrop-blur-xl border-t border-zinc-200/80 bottom-nav-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] select-none"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1 max-w-md mx-auto">
        {mode === 'clients' ? (
          <>
            {/* Hoy */}
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'today' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <div className="relative">
                <CalendarCheck className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
                {pendingUrgentCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold flex items-center justify-center bg-zinc-900 text-white">
                    {pendingUrgentCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">Hoy</span>
            </button>

            {/* Trabajos */}
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'jobs' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <Layers className={`w-5 h-5 ${activeTab === 'jobs' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Trabajos</span>
            </button>

            {/* Central Action: (+) Universal Creator */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={onOpenCreateModal}
                className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                title="Crear registro"
                aria-label="Crear registro"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Clientes (Directorio con Historial Completo) */}
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'clients' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <Users className={`w-5 h-5 ${activeTab === 'clients' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Clientes</span>
            </button>

            {/* Finanzas */}
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'finance' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <div className="relative">
                <CreditCard className={`w-5 h-5 ${activeTab === 'finance' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
                {hasPendingDebt && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">Finanzas</span>
            </button>
          </>
        ) : (
          <>
            {/* Personal: Mi Día */}
            <button
              onClick={() => setActiveTab('today')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'today' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <CalendarCheck className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Mi Día</span>
            </button>

            {/* Personal: Materias U */}
            <button
              onClick={() => setActiveTab('personal_subjects')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'personal_subjects' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${activeTab === 'personal_subjects' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Materias</span>
            </button>

            {/* Central Action: (+) Universal Creator */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={onOpenCreateModal}
                className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
                title="Crear registro"
                aria-label="Crear registro"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Personal: Proyectos & Notas */}
            <button
              onClick={() => setActiveTab('personal_ideas')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'personal_ideas' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${activeTab === 'personal_ideas' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Ideas & Notas</span>
            </button>

            {/* Personal: Ahorro */}
            <button
              onClick={() => setActiveTab('personal_savings')}
              className={`flex-1 flex flex-col items-center py-1 rounded-xl transition-colors ${
                activeTab === 'personal_savings' ? 'text-zinc-950 font-semibold' : 'text-zinc-400'
              }`}
            >
              <PiggyBank className={`w-5 h-5 ${activeTab === 'personal_savings' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Ahorro</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
